import React from 'react';
import { GitBranch, GitCommit } from 'lucide-react';

export function BuildInfo() {
  const branch = __GIT_BRANCH__;
  const commit = __GIT_COMMIT__;
  const repoUrl = __REPO_URL__;
  const commitUrl = `${repoUrl}/commit/${commit === 'unknown' ? '' : commit}`;

  return (
    <footer className="mt-auto border-t border-[#E5E7EB] bg-white px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-end gap-4 text-[11px] text-[#9CA3AF]">
        <a
          href={repoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 hover:text-[#6B7280] transition"
        >
          <GitBranch size={12} />
          {branch}
        </a>
        <a
          href={commitUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 hover:text-[#6B7280] transition font-mono"
        >
          <GitCommit size={12} />
          {commit}
        </a>
      </div>
    </footer>
  );
}
