import {
  chmod,
  lstat,
  mkdtemp,
  open,
  readdir,
  rename,
  rm,
  unlink,
} from 'node:fs/promises'
import { constants } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { basename, dirname, join } from 'node:path'

async function pathStatus(path: string) {
  try {
    return await lstat(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined
    }
    throw error
  }
}

async function assertFileDestinationIsSafe(path: string): Promise<void> {
  const status = await pathStatus(path)
  if (status?.isSymbolicLink()) {
    throw new Error(`Refusing to replace symbolic link: ${path}`)
  }
  if (status !== undefined && !status.isFile()) {
    throw new Error(`Refusing to replace non-file destination: ${path}`)
  }
}

async function syncDirectory(path: string): Promise<void> {
  let directory
  try {
    directory = await open(path, constants.O_RDONLY)
    await directory.sync()
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (!['EINVAL', 'EISDIR', 'ENOTSUP', 'EPERM'].includes(code ?? '')) {
      throw error
    }
  } finally {
    await directory?.close()
  }
}

/** Atomically replace a regular file without ever opening the destination. */
export async function writePrivateFile(path: string, contents: string): Promise<void> {
  await assertFileDestinationIsSafe(path)

  const parent = dirname(path)
  const temporaryPath = join(parent, `.${basename(path)}.tmp-${randomUUID()}`)
  let temporaryFile

  try {
    temporaryFile = await open(
      temporaryPath,
      constants.O_WRONLY |
        constants.O_CREAT |
        constants.O_EXCL |
        (constants.O_NOFOLLOW ?? 0),
      0o600
    )
    await temporaryFile.writeFile(contents, 'utf8')
    await temporaryFile.sync()
    await temporaryFile.close()
    temporaryFile = undefined

    // Detect a destination changed to a symlink while the temporary file was written.
    await assertFileDestinationIsSafe(path)
    await rename(temporaryPath, path)
    await syncDirectory(parent)
  } catch (error) {
    await temporaryFile?.close().catch(() => undefined)
    await unlink(temporaryPath).catch(unlinkError => {
      if ((unlinkError as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw unlinkError
      }
    })
    throw error
  }
}

export interface PrivateDirectoryOptions {
  /** Identify every entry the exporter owns and may replace. */
  isManagedEntry(name: string): boolean
}

async function validateManagedDirectory(
  path: string,
  options: PrivateDirectoryOptions
) {
  const status = await pathStatus(path)
  if (status?.isSymbolicLink()) {
    throw new Error(`Refusing to replace symbolic link: ${path}`)
  }
  if (status !== undefined && !status.isDirectory()) {
    throw new Error(`Refusing to replace non-directory destination: ${path}`)
  }
  if (status?.isDirectory()) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) {
        throw new Error(`Refusing to replace managed symbolic link: ${join(path, entry.name)}`)
      }
      if (!entry.isFile() || !options.isManagedEntry(entry.name)) {
        throw new Error(`Refusing to remove unmanaged export entry: ${join(path, entry.name)}`)
      }
    }
  }
  return status
}

/**
 * Build a directory privately, then swap it into place without merging with a
 * previous export. Refuse unexpected entries so unrelated data is never removed.
 */
export async function replacePrivateDirectory(
  path: string,
  populate: (temporaryDirectory: string) => Promise<void>,
  options: PrivateDirectoryOptions
): Promise<void> {
  const parent = dirname(path)
  const directoryName = basename(path)
  const existing = await validateManagedDirectory(path, options)

  const temporaryDirectory = await mkdtemp(join(parent, `.${directoryName}.tmp-`))
  await chmod(temporaryDirectory, 0o700)
  let backupPath: string | undefined

  try {
    await populate(temporaryDirectory)
    await syncDirectory(temporaryDirectory)

    // Recheck every managed entry before the swap so a newly introduced
    // symlink or unrelated file is never replaced silently.
    const current = await validateManagedDirectory(path, options)
    if (existing === undefined && current !== undefined) {
      throw new Error(`Refusing to replace destination created during export: ${path}`)
    }

    if (current !== undefined) {
      backupPath = join(parent, `.${directoryName}.backup-${randomUUID()}`)
      await rename(path, backupPath)
    }

    try {
      await rename(temporaryDirectory, path)
    } catch (error) {
      if (backupPath !== undefined) {
        await rename(backupPath, path)
        backupPath = undefined
      }
      throw error
    }

    await syncDirectory(parent)
    if (backupPath !== undefined) {
      await rm(backupPath, { recursive: true })
      backupPath = undefined
    }
  } catch (error) {
    await rm(temporaryDirectory, { recursive: true, force: true })
    throw error
  }
}
