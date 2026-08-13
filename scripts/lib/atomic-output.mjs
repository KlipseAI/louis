import {
  chmodSync,
  closeSync,
  fsyncSync,
  lstatSync,
  openSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";

function entryExists(path) {
  try {
    lstatSync(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function removeIfPresent(path) {
  if (entryExists(path)) unlinkSync(path);
}

/**
 * Stages every output before replacing any destination, then restores every
 * replaced entry if a commit step fails. Callers must validate repository
 * boundaries, symlinks, and hardlinks before invoking this function.
 */
export function atomicWriteBatch(entries, options = {}) {
  if (entries.length === 0) return;
  const nonce = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const plans = entries.map((entry, index) => {
    const parent = dirname(entry.absolute);
    const existing = entryExists(entry.absolute);
    const mode = existing ? lstatSync(entry.absolute).mode & 0o777 : 0o644;
    return {
      ...entry,
      existing,
      mode,
      staged: resolve(parent, `.generated-output-${nonce}-${index}.tmp`),
      backup: resolve(parent, `.generated-output-${nonce}-${index}.bak`),
      committed: false,
      backedUp: false,
    };
  });

  try {
    // Prepare and flush every new file before any destination changes.
    for (const plan of plans) {
      const descriptor = openSync(plan.staged, "wx", plan.mode);
      try {
        writeFileSync(descriptor, plan.expected, "utf8");
        fsyncSync(descriptor);
      } finally {
        closeSync(descriptor);
      }
      chmodSync(plan.staged, plan.mode);
    }

    for (const [index, plan] of plans.entries()) {
      if (plan.existing) {
        renameSync(plan.absolute, plan.backup);
        plan.backedUp = true;
      }
      renameSync(plan.staged, plan.absolute);
      plan.committed = true;
      if (options.failAfterCommit === index + 1) {
        throw new Error(`atomic output test failure after commit ${index + 1}`);
      }
    }
  } catch (error) {
    const rollbackErrors = [];
    for (const plan of [...plans].reverse()) {
      try {
        if (plan.committed) removeIfPresent(plan.absolute);
        if (plan.backedUp && entryExists(plan.backup)) {
          renameSync(plan.backup, plan.absolute);
        }
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }
    for (const plan of plans) {
      try {
        removeIfPresent(plan.staged);
        removeIfPresent(plan.backup);
      } catch (cleanupError) {
        rollbackErrors.push(cleanupError);
      }
    }
    if (rollbackErrors.length > 0) {
      throw new AggregateError(
        [error, ...rollbackErrors],
        "Atomic output write and rollback failed.",
      );
    }
    throw error;
  }

  // The new batch is complete at this point. Cleanup failure must never
  // delete a successfully committed destination after older backups have
  // already been removed; leave any remaining backup visible to the next
  // preflight and report it instead.
  const cleanupErrors = [];
  for (const plan of plans) {
    try {
      removeIfPresent(plan.backup);
    } catch (error) {
      cleanupErrors.push(error);
    }
  }
  if (cleanupErrors.length > 0) {
    throw new AggregateError(
      cleanupErrors,
      "Generated outputs committed, but backup cleanup failed.",
    );
  }
}
