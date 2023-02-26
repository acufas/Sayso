const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const app = express();
const db = new sqlite3.Database('database/database.db');

// Middleware to parse request bodies
app.use(bodyParser.json());
app.use('/', express.static('src/public'));

// CRUD endpoints for posts
app.get('/posts', (req, res) => {
  db.all('SELECT * FROM posts', (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.status(200).json(rows);
  });
});

app.get('/posts/:id', (req, res) => {
  db.get('SELECT * FROM posts WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(row);
  });
});

app.post('/posts', (req, res) => {
  const post = {
    title: req.body.title,
    content: req.body.content,
    votes: 0,
    created_at: new Date().toDateString()
  };
  db.run('INSERT INTO posts (title, content, votes, created_at) VALUES (?, ?, ?, ?)',
    [post.title, post.content, post.votes, post.created_at],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      post.id = this.lastID;
      res.status(201).json(post);
    }
  );
});

app.put('/posts/:id', (req, res) => {
  db.get('SELECT * FROM posts WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Post not found' });
    }
    db.run('UPDATE posts SET title = ?, content = ? WHERE id = ?',
      [req.body.title, req.body.content, req.params.id],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        db.get('SELECT * FROM posts WHERE id = ?', [req.params.id], (err, row) => {
          if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
          }
          res.status(200).json(row);
        });
      }
    );
  });
});

app.delete('/posts/:id', (req, res) => {
  db.get('SELECT * FROM posts WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Post not found' });
    }
    db.run('DELETE FROM posts WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.status(204).send();
    });
  });
});

// CRUD endpoints for comments
app.get('/posts/:postId/comments', (req, res) => {  
  db.get('SELECT * FROM posts WHERE id = ?', [req.params.postId], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Post not found' });
    }
    db.all('SELECT * FROM comments WHERE post_id = ?', [req.params.postId], (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.status(200).json(rows);
    });
  });
});

app.get('/posts/:postId/comments/:commentId', (req, res) => {
  db.get('SELECT * FROM posts WHERE id = ?', [req.params.postId], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Post not found' });
    }
    db.get('SELECT * FROM comments WHERE id = ? AND post_id = ?', [req.params.commentId, req.params.postId], (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      if (!row) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      res.status(200).json(row);
    });
  });
});

app.post('/posts/:postId/comments', (req, res) => {
  const comment = {
    content: req.body.content
  };
  db.get('SELECT * FROM posts WHERE id = ?', [req.params.postId], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Post not found' });
    }
    db.run('INSERT INTO comments (post_id, content) VALUES (?, ?)',
      [req.params.postId, comment.content],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        comment.id = this.lastID;
        res.status(201).json(comment);
      }
    );
  });
});

app.put('/posts/:postId/comments/:commentId', (req, res) => {
  db.get('SELECT * FROM posts WHERE id = ?', [req.params.postId], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Post not found' });
    }
    db.get('SELECT * FROM comments WHERE id = ? AND post_id = ?', [req.params.commentId, req.params.postId], (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      if (!row) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      db.run('UPDATE comments SET content = ? WHERE id = ? AND post_id = ?',
        [req.body.content, req.params.commentId, req.params.postId],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
          }
          db.get('SELECT * FROM comments WHERE id = ? AND post_id = ?',
            [req.params.commentId, req.params.postId],
            (err, row) => {
              if (err) {
                return res.status(500).json({ message: 'Internal Server Error' });
              }
              res.status(200).json(row);
            }
          );
        }
      );
    });
  });
});

app.delete('/posts/:postId/comments/:commentId', (req, res) => {
  db.get('SELECT * FROM posts WHERE id = ?', [req.params.postId], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Post not found' });
    }
    db.get('SELECT * FROM comments WHERE id = ? AND post_id = ?', [req.params.commentId, req.params.postId], (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      if (!row) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      db.run('DELETE FROM comments WHERE id = ? AND post_id = ?',
        [req.params.commentId, req.params.postId],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
          }
          res.status(204).send();
        }
      );
    });
  });
});

// Endpoint for voting on posts.
app.patch('/posts/:id/vote', (req, res) => {
  db.get('SELECT * FROM posts WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Post not found' });
    }
    let votes = row.votes;
    if (req.body.vote === 'up') {
      votes += 1;
    } else if (req.body.vote === 'down') {
      votes -= 1;
    } else {
      return res.status(400).json({ message: 'Invalid vote value' });
    }
    db.run('UPDATE posts SET votes = ? WHERE id = ?',
      [votes, req.params.id],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        db.get('SELECT * FROM posts WHERE id = ?', [req.params.id], (err, row) => {
          if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
          }
          res.status(200).json(row);
        });
      }
    );
  });
});

// Start server
app.listen(3000, () => console.log('Server started on port 3000'));

