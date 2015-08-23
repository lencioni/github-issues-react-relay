const truncateString = require('../lib/truncateString');

class IssueSummary extends React.Component {
  render() {
    const {
      issue,
    } = this.props;

    return (
      <div>
        <div>
          #{issue.number}
          {' '}
          {issue.title}
        </div>

        <div>
          by {issue.user.login}
          <img src={issue.user.avatarUrl} height={50} width={50}/>
        </div>

        <div>
          {truncateString(issue.body, 140)}
        </div>

        <ul>
          {issue.labels.map(label =>
            <li key={label.id} style={{ color: `#${label.color}` }}>
              {label.name}
            </li>
          )}
        </ul>
      </div>
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
