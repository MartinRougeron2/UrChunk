
const getPosts = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/posts');
        const json = await response.json();
        return json.posts;

    } catch (error) {
        console.log(error);
    }
}

const posts = getPosts();
// display all the posts
const postList = posts.map((post) => {
  return (
    <div className="User__post">
      <div className="User__post__name">{post.name}</div>
      <div className="User__post__content">{post.content}</div>
    </div>
  );
});
