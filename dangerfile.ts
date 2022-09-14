import {danger, warn, fail} from 'danger';
const reviewLargePR = () => {
    const bigPRThreshold = 600;
    if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
        warn(`:exclamation: Pull Request size seems relatively large. If Pull Request contains multiple changes, split each into separate PR for faster, easier review.`);
    }
}
const ensurePRHasAssignee = () => {
    // Always ensure we assign someone, so that our Slackbot can do its work correctly
    if (danger.github.pr.assignee === null) {
    fail("Please assign someone to merge this PR, and optionally include people who should review.")
  }
}

const packageChanged = danger.git.modified_files.includes('package.json');
const lockfileChanged = danger.git.modified_files.includes('package-lock.json');

if (packageChanged && !lockfileChanged) {
    warn(`Changes were made to package.json, but not to package-lock.json - <i>'Perhaps you need to run npm install'?'</i>`);
}
danger.git.commits.forEach(commit => {
    if (!commit.message.match(/^(feat:)|(fix:)|(major:)|(chore:)/g)) {
      fail(`Commit message '${commit.message}' does match the correct format`);
    }
  })
  
reviewLargePR();
ensurePRHasAssignee();