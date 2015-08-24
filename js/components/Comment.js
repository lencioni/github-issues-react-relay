const Card = require('./Card');
const Markdown = require('./Markdown');

class Comment extends React.Component {
  render() {
    const {
      comment,
    } = this.props;

    return (
      <div className='display--flex'>
        <div
          style={{
            margin: '10px 10px 0 0',
          }}
          >
          <img
            alt=''
            src={comment.user.avatarUrl}
            style={{
              borderRadius: 3,
              height: 50,
              width: 50,
            }}
          />
        </div>

        <Card>
          <Markdown source={comment.body} />
        </Card>
      </div>
    );
  }
}

export default Relay.createContainer(Comment, {
  fragments: {
    comment: () => Relay.QL`
      fragment on Comment {
        body,
        user {
          avatarUrl,
        },
      },
    `,
  },
});
