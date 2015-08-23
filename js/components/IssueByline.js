class IssueByline extends React.Component {
  render() {
    const {
      issue,
    } = this.props;

    return (
      <span>
        #{issue.number}
        {' '}
        opened by
        {' '}
        <a href={`https://github.com/${issue.user.login}`}>
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
        </a>
      </span>
    );
  }
}

export default Relay.createContainer(IssueByline, {
  fragments: {
    issue: () => Relay.QL`
      fragment on Issue {
        number,
        user {
          avatarUrl,
          login,
        }
      }
    `,
  },
});
