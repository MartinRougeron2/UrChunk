// react component to interact with the express server

const Post = ({post}) => {
    const [isOwner, setIsOwner] = useState(false);
    const [isBuyer, setIsBuyer] = useState(false);
    const [price, setPrice] = useState(0);
    const [post, createPost] = useState(null);
    const [isChangingPrice, setIsChangingPrice] = useState(false);

    useEffect(() => {
        setIsOwner(post.isOwner);
        setIsBuyer(post.isBuyer);
        setPrice(post.price);
    }, [post]);

    const buy = async () => {
        try {
            await post.contract.buy(post.address, {from: post.currentAccount, value: price});
            setIsBuyer(true);
        } catch (err) {
            console.log(err);
        }
    };

    const changePrice = async () => {
        try {
            await post.contract.changePrice(price, post.address, {from: post.currentAccount});
            setIsChangingPrice(false);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="Post">
            <div className="Post__name">{post.name}</div>
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
            <div className="Post__button">
                {isBuyer ? (
                    <div>Buyer</div>
                ) : (
                    <button onClick={buy}>Buy</button>
                )}
            </div>
        </div>
    );
}