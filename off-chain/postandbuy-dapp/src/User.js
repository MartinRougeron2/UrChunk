// react component to display the user's information
const User = ({ user }) => {
  const [isOwner, setIsOwner] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  const [price, setPrice] = useState(0);
  const [post, createPost] = useState(null);
  const [isChangingPrice, setIsChangingPrice] = useState(false);

  useEffect(() => {
    setIsOwner(user.isOwner);
    setIsBuyer(user.isBuyer);
    setPrice(user.price);
  }, [user]);

  const buy = async () => {
    try {
      await user.contract.buy(user.address, { from: user.currentAccount, value: price });
      setIsBuyer(true);
    } catch (err) {
      console.log(err);
    }
  };

  const changePrice = async () => {
    try {
      await user.contract.changePrice(price, user.address, { from: user.currentAccount });
      setIsChangingPrice(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="User">
      <div className="User__name">{user.name}</div>
      <div className="User__content">{user.content}</div>
      <div className="User__price">
        {isOwner ? (
          isChangingPrice ? (
            <div>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <button onClick={changePrice}>Change Price</button>
            </div>
          ) : (
            <div>
              <div>{price}</div>
              <button onClick={() => setIsChangingPrice(true)}>Change Price</button>
            </div>
          )
        ) : (
          <div>{price}</div>
        )}
      </div>
      <div className="User__button">
        {isBuyer ? (
          <div>Buyer</div>
        ) : isOwner ? (
          <div>Owner</div>
        ) : (
          <button onClick={buy}>Buy</button>
        )}
      </div>
      // display the create post button if the user is the owner
        {isOwner && <button onClick={() => createPost(<CreatePost user={user} />)}>Create Post</button>}
      // display the post if it is created
        {post}
      // display all the posts created by the user
        {user.posts.map((post) => (
            <Post post={post} user={user} />
        ))}
    </div>
    );
};