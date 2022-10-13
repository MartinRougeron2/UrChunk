// header with app name and with user in top right corner and a button to create a new post

const header = () => {
    return (
        <div className="Header">
            <div className="Header__title">Post and Buy</div>
            <div className="Header__user">
                <User user={user} />
            </div>
            {isOwner ? (
                <div className="Header__newPost">
                    <button onClick={() => setIsCreatingPost(true)}>Create Post</button>
                </div>
            ) : null}
        </div>
    );
};

