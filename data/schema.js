/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  connectionFromPromisedArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

import {
  Issue,
  Comment,
  Label,
  Repo,
  User,
  getIssue,
  getIssues,
  getComments,
  getRepo,
} from './database';

/**
 * We get the node interface and field from the Relay library.
 *
 * The first method defines the way we resolve an ID to its object.
 * The second defines the way we resolve an object to its GraphQL type.
 */
var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'Repo') {
      return getRepo(id);
    } else if (type === 'Issue') {
      // In this case, the id is the number of the issue.
      return getIssue(id);
    } else {
      return null;
    }
  },
  (obj) => {
    if (obj instanceof Repo) {
      return repoType;
    } else if (obj instanceof Issue) {
      return issueType;
    } else if (obj instanceof Comment) {
      return commentType;
    } else if (obj instanceof Label) {
      return labelType;
    } else if (obj instanceof User) {
      return userType;
    } else {
      return null;
    }
  }
);

/**
 * Define your own types here
 */

var repoType = new GraphQLObjectType({
  name: 'Repo',
  description: 'A GitHub repo',
  fields: () => ({
    id: globalIdField('Repo'),
    name: {
      type: GraphQLString,
      description: 'The name of the repo',
      resolve: repo => repo.id,
    },
    issues: {
      type: issueConnection,
      description: 'Issues that people have opened',
      args: connectionArgs,
      // TODO don't use connectionFromPromisedArray here maybe,
      resolve: (repo, args) => connectionFromPromisedArray(
        getIssues(args), args),
    },
  }),
  interfaces: [nodeInterface],
});

var issueType = new GraphQLObjectType({
  name: 'Issue',
  description: 'A GitHub issue',
  fields: () => ({
    id: globalIdField('Issue'),
    number: {
      type: GraphQLInt,
      description: 'Number of the issue',
      resolve: issue => issue.number,
    },
    title: {
      type: GraphQLString,
      description: 'Title of the issue',
      resolve: issue => issue.title,
    },
    user: {
      type: userType,
      description: 'The creator of the issue',
      resolve: issue => issue.user,
    },
    labels: {
      type: new GraphQLList(labelType),
      description: 'Labels associated with the issue',
      resolve: issue => issue.labels,
    },
    state: {
      type: GraphQLString,
      description: 'State the issue is in (e.g. open or closed)',
      resolve: issue => issue.state,
    },
    locked: {
      type: GraphQLBoolean,
      description: 'Whether or not the issue is locked',
      resolve: issue => issue.locked,
    },
    body: {
      type: GraphQLString,
      description: 'The body of the issue',
      resolve: issue => issue.body,
    },
    createdAt: {
      type: GraphQLString,
      description: 'Time the issue was created',
      resolve: issue => issue.created_at,
    },
    updatedAt: {
      type: GraphQLString,
      description: 'Time the issue was last updated',
      resolve: issue => issue.updated_at,
    },
    closedAt: {
      type: GraphQLString,
      description: 'Time the issue was closed',
      resolve: issue => issue.closed_at,
    },
    comments: {
      type: commentConnection,
      description: 'Comments on issues',
      args: connectionArgs,
      resolve: (issue, args) => connectionFromPromisedArray(
        getComments(issue, args), args),
    },
  }),
  interfaces: [nodeInterface],
});

var labelType = new GraphQLObjectType({
  name: 'Label',
  description: 'A GitHub issue label',
  fields: () => ({
    id: globalIdField('Label', label => label.url),
    name: {
      type: GraphQLString,
      description: "The label's name",
      resolve: label => label.name,
    },
    color: {
      type: GraphQLString,
      description: "The label's color",
      resolve: label => label.color,
    },
  }),
  interfaces: [nodeInterface],
});

var userType = new GraphQLObjectType({
  name: 'User',
  description: 'A GitHub user',
  fields: () => ({
    id: globalIdField('User'),
    login: {
      type: GraphQLString,
      description: "The user's username",
      resolve: user => user.login,
    },
    avatarUrl: {
      type: GraphQLString,
      description: "The URL for the user's avatar",
      resolve: user => user.avatar_url,
    },
  }),
  interfaces: [nodeInterface],
});

var commentType = new GraphQLObjectType({
  name: 'Comment',
  description: 'A GitHub comment',
  fields: () => ({
    id: globalIdField('Comment'),
    body: {
      type: GraphQLString,
      description: 'The body of the comment',
      resolve: comment => comment.body,
    },
    user: {
      type: userType,
      description: 'The creator of the issue',
      resolve: issue => issue.user,
    },
  }),
  interfaces: [nodeInterface],
});

const { connectionType: issueConnection } =
  connectionDefinitions({ name: 'Issue', nodeType: issueType });
const { connectionType: commentConnection } =
  connectionDefinitions({ name: 'Comment', nodeType: commentType });

/**
 * This is the type that will be the root of our query,
 * and the entry point into our schema.
 */
var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    repo: {
      type: repoType,
      resolve: () => getRepo(),
    },
    issue: {
      type: issueType,
      resolve: () => getIssue(),
    },
  }),
});

/**
 * This is the type that will be the root of our mutations,
 * and the entry point into performing writes in our schema.
 */
var mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    // Add your own mutations here
  })
});

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export var Schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType
});
