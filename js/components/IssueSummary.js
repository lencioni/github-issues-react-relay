const Card = require('./Card');
const IssueByline = require('./IssueByline');
const IssueLabels = require('./IssueLabels');
const TruncateLongLines = require('./TruncateLongLines');
const truncateString = require('../lib/truncateString');
const { Link } = require('react-router');

class IssueSummary extends React.Component {
  render() {
    const {
      issue,
    } = this.props;

    return (
      <Card>
        <div
          style={{
            fontWeight: 'bold',
            marginBottom: '.2em',
          }}
          >
          <TruncateLongLines>
            <Link to={`/issues/${issue.id}`}>
              {issue.title}
            </Link>
          </TruncateLongLines>
        </div>

        <div
          style={{
            fontSize: 13,
          }}
          >
          <IssueByline issue={issue} />
        </div>

        <div style={{ marginBottom: '.3em' }}>
          <IssueLabels issue={issue} />
        </div>

        <div
          style={{
            color: '#888',
            fontSize: 13,
          }}
          >
          <TruncateLongLines>
            {truncateString(issue.body, 140)}
          </TruncateLongLines>
        </div>
      </Card>
    );
  }
}

export default Relay.createContainer(IssueSummary, {
  fragments: {
    issue: () => Relay.QL`
      fragment on Issue {
        id,
        body,
        title,
        ${IssueByline.getFragment('issue')},
        ${IssueLabels.getFragment('issue')},
      }
    `,
  },
});
