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
// react component display all the posts
const Posts = () => {
    return (
        <div className="Posts">
            {posts.map((post) => (
                <Post post={post}/>
            ))}
        </div>
    );
}

