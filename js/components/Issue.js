const Card = require('./Card');
const Comment = require('./Comment');
const IssueByline = require('./IssueByline');
const IssueLabels = require('./IssueLabels');
const Markdown = require('./Markdown');
const PageContainer = require('./PageContainer');
const TruncateLongLines = require('./TruncateLongLines');
const Waypoint = require('react-waypoint');
const { Link } = require('react-router');

const COMMENTS_PER_PAGE = 25;

class Issue extends React.Component {
  addPage() {
    const newCount = this.props.relay.variables.count + COMMENTS_PER_PAGE;
    this.props.relay.setVariables({
      count: newCount,
    });
  }

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
          <span
            style={{
              backgroundColor: issue.state === 'open' ? '#0a0' : '#a00',
              borderRadius: 3,
              display: 'inline-block',
              color: '#fff',
              fontWeight: 500,
              padding: '4px 8px',
            }}
            >
            {issue.state[0].toUpperCase()}
            {issue.state.substr(1)}
          </span>
          {' '}
          <IssueByline issue={issue} />
        </div>

        <div>
          <IssueLabels issue={issue} />
        </div>

        <Card>
          <Markdown source={issue.body} />
        </Card>

        {issue.comments.edges.map(comment =>
          <Comment comment={comment.node} />
        )}

        <Waypoint onEnter={() => this.addPage()} threshold={1} />
      </PageContainer>
    );
  }
}

export default Relay.createContainer(Issue, {
  initialVariables: {
    count: COMMENTS_PER_PAGE,
  },

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
        body,
        state,
        ${IssueByline.getFragment('issue')},
        ${IssueLabels.getFragment('issue')},
        comments(first: $count) {
          edges {
            node {
              ${Comment.getFragment('comment')},
            },
          },
        },
      }
    `,
  },
});
