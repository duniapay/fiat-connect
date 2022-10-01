import { danger, warn, fail } from 'danger'

// Warn (won’t fail the CI, just post a comment) if the PR has
// changes in package.json but no changes in package-lock.json
const packageChanged = danger.git.modified_files.includes('package.json')
const lockfileChanged = danger.git.modified_files.includes('package-lock.json')
if (packageChanged && !lockfileChanged) {
  warn(
    'Changes were made to package.json, but not to ' +
      'package-lock.json.' +
      'Perhaps you need to run `npm install` and commit changes ' +
      'in package-lock.json. Make sure you’re using npm 5+.',
  )
}

const jsTestChanges = danger.git.modified_files.filter((f) =>
  f.endsWith('.spec.js'),
)
jsTestChanges.forEach((file) => {
  const content = fs.readFileSync(file).toString()
  if (content.includes('it.only') || content.includes('describe.only')) {
    fail(`An \`.only\` was left in tests (${file})`)
  }
})

// Add a CHANGELOG entry for app changes
const hasChangelog = danger.git.modified_files.includes('changelog.md')
const isTrivial = (danger.github.pr.body + danger.github.pr.title).includes(
  '#trivial',
)
if (!hasChangelog && !isTrivial) {
  warn('Please add a changelog entry for your changes.')
}

const { additions = 0, deletions = 0 } = danger.github.pr
message(`:tada: The PR added ${additions} and removed ${deletions} lines.`)
const modifiedMD = danger.git.modified_files.join('\n')
message(`Changed Files in this PR: \n ${modifiedMD} \n`)

// No PR is too small to include a description of why you made a change
if (danger.github.pr.body.length < 10) {
  warn('Please include a description of your PR changes.')
}

// Request changes to src also include changes to tests.
const hasAppChanges = danger.git.modified_files.length > 0

const testChanges = danger.git.modified_files.filter((filepath) =>
  filepath.includes('test'),
)
const hasTestChanges = testChanges.length > 0

// Warn if there are library changes, but not tests
if (hasAppChanges && !hasTestChanges) {
  warn(
    "There are library changes, but not tests. That's OK as long as you're refactoring existing code",
  )
}

const bigPRThreshold = 600
let errorCount = 0

if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
  warn(':exclamation: Big PR (' + ++errorCount + ')')
  markdown(
    '> (' +
      errorCount +
      ') : Pull Request size seems relatively large. If Pull Request contains multiple changes, split each into separate PR will helps faster, easier review.',
  )
}

// Don't have folks setting the package json version
const packageDiff = danger.git.JSONDiffForFile('package.json')
if (packageDiff.version && danger.github.pr.user.login !== 'SergeWilfried') {
  fail("Please don't make package version changes")
}

danger.github.setSummaryMarkdown('Looking good')

danger.git.commits.forEach((commit) => {
  if (!commit.message.match(/^(feat:)|(fix:)|(major:)|(chore:)|(refactor:)/g)) {
    fail(`Commit message '${commit.message}' does match the correct format`)
  }
})
