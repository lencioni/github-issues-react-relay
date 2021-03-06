const Label = require('./Label');

class IssueLabels extends React.Component {
  render() {
    const {
      issue,
    } = this.props;

    if (!issue.labels.length) {
      return null;
    }

    return (
      <span>
        {issue.labels.map(label =>
          <span
            style={{
              marginRight: '.5em',
            }}
            >
            <Label key={label.id} label={label} />
          </span>
        )}
      </span>
    );
  }
}

export default Relay.createContainer(IssueLabels, {
  fragments: {
    issue: () => Relay.QL`
      fragment on Issue {
        labels {
          id,
          ${Label.getFragment('label')},
        },
      }
    `,
  },
});
