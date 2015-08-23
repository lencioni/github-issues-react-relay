const Card = require('./Card');
const Label = require('./Label');
const TruncateLongLines = require('./TruncateLongLines');
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
            marginBottom: '.2em',
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

        {issue.labels.length > 0 &&
          <div style={{ display: 'inline-block', marginBottom: '.3em', }}>
            {issue.labels.map(label =>
              <span
                style={{
                  marginRight: '.5em',
                }}
                >
                <Label key={label.id} label={label} />
              </span>
            )}
          </div>
        }

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
        body,
        labels {
          id,
          ${Label.getFragment('label')},
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
