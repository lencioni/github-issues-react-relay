const IssueByline = require('./IssueByline');
const IssueLabels = require('./IssueLabels');
const PageContainer = require('./PageContainer');
const TruncateLongLines = require('./TruncateLongLines');
const { Link } = require('react-router');

class Issue extends React.Component {
  render() {
    const {
      issue,
    } = this.props;

    return (
      <PageContainer>
        <Link to='/'>
          &larr; Back to {this.props.repo.name}
        </Link>

        <h1>
          <TruncateLongLines>
            {issue.title}
          </TruncateLongLines>
        </h1>

        <div>
          <IssueByline issue={issue} />
        </div>

        <div>
          <IssueLabels issue={issue} />
        </div>
      </PageContainer>
    );
  }
}

export default Relay.createContainer(Issue, {
  fragments: {
    repo: () => Relay.QL`
      fragment on Repo {
        name,
      },
    `,
    issue: () => Relay.QL`
      fragment on Issue {
        id,
        title,
        ${IssueByline.getFragment('issue')},
        ${IssueLabels.getFragment('issue')},
      }
    `,
  },
});
