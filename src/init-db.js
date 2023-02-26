const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

// Read the schema file
const schema = fs.readFileSync('database/schema.sql', 'utf8');

// Open a new database connection
const db = new sqlite3.Database('database/database.db');

// Execute the schema SQL to create the table
db.exec(schema, (err) => {
  if (err) throw err;
  console.log('Created table successfully');
});

// Seed the database with sample data
const samplePosts = [
  {
    id: uuidv4(),
    title: 'Post 1',
    content: 'Content for post 1',
    createdAt: new Date().toISOString(),
    votes: 0
  },
  {
    id: uuidv4(),
    title: 'Post 2',
    content: 'Content for post 2',
    createdAt: new Date().toISOString(),
    votes: 0
  },
  {
    id: uuidv4(),
    title: 'Post 3',
    content: 'Content for post 3',
    createdAt: new Date().toISOString(),
    votes: 0
  },
  {
    id: uuidv4(),
    title: 'Post 4',
    content: 'Content for post 4',
    createdAt: new Date().toISOString(),
    votes: 0
  },
  {
    id: uuidv4(),
    title: 'Post 5',
    content: 'Content for post 5',
    createdAt: new Date().toISOString(),
    votes: 0
  }
];

const sampleComments = [
  {
    id: uuidv4(),
    post_id: samplePosts[0].id,
    content: 'Comment on post 1'
  },
  {
    id: uuidv4(),
    post_id: samplePosts[1].id,
    content: 'Comment on post 2'
  },
  {
    id: uuidv4(),
    post_id: samplePosts[1].id,
    content: 'Another comment on post 2'
  }
];

// Insert the sample posts into the database
for (const post of samplePosts) {
  db.run('INSERT INTO posts (id, title, content, created_at, votes) VALUES (?, ?, ?, ?, ?)', [post.id, post.title, post.content, post.createdAt, post.votes], (err) => {
    if (err) throw err;
    console.log(`Inserted post '${post.title}' successfully`);
  });
}

// Insert the sample comments into the database
for (const comment of sampleComments) {
  db.run('INSERT INTO comments (id, post_id, content) VALUES (?, ?, ?)', [comment.id, comment.post_id, comment.content], (err) => {
    if (err) throw err;
    console.log(`Inserted comment '${comment.content}' successfully`);
  });
}

// Close the database connection when done
db.close();
