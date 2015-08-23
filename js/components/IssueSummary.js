const Card = require('./Card');
const truncateString = require('../lib/truncateString');

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
          }}
          >
          {issue.title}
        </div>

        <div
          style={{
            fontSize: 13,
          }}
          >
          #{issue.number}
          {' '}
          opened by
          {' '}
          <img
            alt=''
            src={issue.user.avatarUrl}
            style={{
              height: '.85em',
              width: '.85em',
            }}
          />
          {' '}
          {issue.user.login}
        </div>

        <div
          style={{
            color: '#888',
            fontSize: 13,
          }}
          >
          {truncateString(issue.body, 140)}
        </div>

        {issue.labels.count > 0 &&
          <ul>
            {issue.labels.map(label =>
              <li key={label.id} style={{ color: `#${label.color}` }}>
                {label.name}
              </li>
            )}
          </ul>
        }
      </Card>
    );
  }
}

export default Relay.createContainer(IssueSummary, {
  fragments: {
    issue: () => Relay.QL`
      fragment on Issue {
        body,
        labels {
          id,
          color,
          name,
        },
        number,
        title,
        user {
          avatarUrl,
          login,
        }
      }
    `,
  },
});
