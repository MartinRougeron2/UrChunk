// // react component to display the post's information
const Post = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [price, setPrice] = useState(0);
  const [isChangingPrice, setIsChangingPrice] = useState(false);
  const [postOwner, setPostOwner] = useState(null);
  const [postBuyer, setPostBuyer] = useState(null);

  useEffect(() => {
    setIsLiked(post.isLiked);
    setIsBuyer(post.isBuyer);
    setIsOwner(post.isOwner);
    setPrice(post.price);
    setPostOwner(post.postOwner);
    setPostBuyer(post.postBuyer);
  }, [post]);

  const like = async () => {
    try {
      await post.contract.like(post.address, { from: post.currentAccount });
      setIsLiked(true);
    } catch (err) {
      console.log(err);
    }
  };

  const buy = async () => {
    try {
      await post.contract.buy(post.address, { from: post.currentAccount, value: price });
      setIsBuyer(true);
    } catch (err) {
      console.log(err);
    }
  };

  const changePrice = async () => {
    try {
      await post.contract.changePrice(price, post.address, { from: post.currentAccount });
      setIsChangingPrice(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="Post">
      <div className="Post__title">{post.title}</div>
      <div className="Post__content">{post.content}</div>
      <div className="Post__price">
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
      <div className="Post__owner">
        <User user={postOwner} />
      </div>
        <div className="Post__buyer">
            <User user={postBuyer} />
        </div>
        <div className="Post__buttons">
        {isLiked ? (
            <button disabled>Liked</button>
        ) : (
            <button onClick={like}>Like</button>
        )}
        {isBuyer ? (
            <button disabled>Bought</button>
        ) : (
            <button onClick={buy}>Buy</button>
        )}
        </div>
    </div>
    );
};