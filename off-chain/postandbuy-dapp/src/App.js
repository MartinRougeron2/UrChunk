import './App.css';
import User from './contracts/User.json';
import Post from './contracts/Post.json';
import {useEffect, useState} from 'react';
import {withCookies, Cookies, useCookies} from 'react-cookie';
// import axios
import axios from 'axios';

import {
    login,
    createUser,
    createPost,
    checkAuth,
    buyPost,
    buyUser,
    changePricePost,
    followUser,
    likePost,
    transferUserOwnership,
    updateUsername,
    updateEmail,
    getPosts,
    getMyUsers,
} from './requests';


// Language: javascript
const App = () => {
    axios.defaults.withCredentials = true;
    //state variable to store user's public wallet
    const [currentAccount, setCurrentAccount] = useState("");

    const [cookies, setCookie] = useCookies(['token'])

// check wallet connection when the page loads
    const checkIfWalletIsConnected = async () => {

        // access to window.ethereum
        const {ethereum} = window;

        //check if user has metamask
        if (!ethereum) {
            alert("Make sure you have metamask");
            return;
        }

        //get the wallet account
        const accounts = await ethereum.request({method: 'eth_accounts'});

        //get the first account
        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found account:", account);

            //set the account as a state
            setCurrentAccount(account);
        } else {
            console.log("No account");
        }
    }

// connect to wallet
    const connectWallet = async () => {
        try {
            const {ethereum} = window;

            if (!ethereum) {
                alert("Opps, looks like there is no wallet!");
                return;
            }

            const currentNetwork = ethereum.networkVersion;
            console.log("Current network", currentNetwork);

            //check which network the wallet is connected on
            if (currentNetwork !== 4) {
                // prompt user with a message to switch to network 4 which is the rinkeby network on metamask
                alert("Opps, only works on Rinkeby! Please change your //network :)");
                return;
            }

            const accounts = await ethereum.request({method: "eth_requestAccounts"});
            setCurrentAccount(accounts[0]);

        } catch (error) {
            console.log(error);
        }
    }


//run function checkIfWalletIsConnected when the page loads
    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

//connect to wallet
    const walletNotConnected = () => (
        <button onClick={connectWallet} className="connect-to-wallet-button">
            Connect to Wallet
        </button>
    );

//wallet connected
    const walletConnected = () => (
        <div>
            <p>Connected to the wallet</p>
        </div>
    );

    // sign message
    const signMessage = async () => {
        const {ethereum} = window;
        // sign a message to prove the user is the owner of the wallet
        const message = "I am signing this message to prove ownership of my wallet";
        const signature = await ethereum.request({
            method: "personal_sign",
            params: [message, currentAccount]
        });
        const res = await login(signature, currentAccount, message);
        if (!res) {
            console.error("Error response from backend is null");
            return;
        }
        setCookie('token', res.data.token, {
            path: '/',
            expires: new Date(Date.now() + 3600000),
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
    }

    const handleCheckAuth = async () => {
        const res = await checkAuth();
        console.log(res);
    }

    const handleCreateUserSubmit = async (event) => {
        event.preventDefault();
        const name = event.target.elements.name.value;
        const email = event.target.elements.email.value;
        const price = event.target.elements.price.value;
        const res = await createUser(name, email, price);
        if (!res) {
            console.error("Error response from backend is null");
            return;
        }
        setCookie('user', res.data.userAddress, {
            path: '/',
            secure: true,
            sameSite: "none",
        })
    }

    const handleCreatePostSubmit = async (event) => {
        event.preventDefault();
        const title = event.target.elements.title.value;
        const description = event.target.elements.content.value;
        const price = event.target.elements.price.value;
        const res = await createPost(title, description, price);
        if (!res) {
            console.error("Error response from backend is null");
            return;
        }
        console.log(res);
    }

    const handleBuyPost = async (event) => {
        event.preventDefault();
        const postAddress = event.target.elements.postAddress.value;
        const price = event.target.elements.price.value;
        const res = await buyPost(postAddress, price);
        if (!res) {
            console.error("Error response from backend is null");
            return;
        }
        console.log(res);
    }

    const handleUpdateUsername = async (event) => {
        event.preventDefault();
        const name = event.target.elements.name.value;
        const res = await updateUsername(name);
        if (!res) {
            console.error("Error response from backend is null");
            return;
        }
        console.log(res);
    }

    const handleUpdateEmail = async (event) => {
        event.preventDefault();
        const email = event.target.elements.email.value;
        const res = await updateEmail(email);
        if (!res) {
            console.error("Error response from backend is null");
            return;
        }
    }

    const handleTransferUserOwnership = async (event) => {
        event.preventDefault();
        const address = event.target.elements.address.value;
        const res = await transferUserOwnership(address);
        if (!res) {
            console.error("Error response from backend is null");
            return;
        }
    }

    const handleBuyUser = async (event) => {
        event.preventDefault();
        const address = event.target.elements.address.value;
        const price = event.target.elements.price.value;
        const res = await buyUser(address, price);
        if (!res) {
            console.error("Error response from backend is null");
            return;
        }
    }

    const handleFollowUser = async (event) => {
        event.preventDefault();
        const address = event.target.elements.address.value;
        const res = await followUser(address);
        if (!res) {
            console.error("Error response from backend is null");
            return;
        }
    }

    const handleLikePost = async (event) => {
        event.preventDefault();
        const address = event.target.elements.address.value;
        const res = await likePost(address);
        if (!res) {
            console.error("Error response from backend is null");
            return;
        }
    }

    const handleChangePricePost = async (event) => {
        event.preventDefault();
        const address = event.target.elements.address.value;
        const price = event.target.elements.price.value;
        const res = await changePricePost(address, price);
        if (!res) {
            console.error("Error response from backend is null");
            return;
        }
    }

    const handleGetPosts = async () => {
        const res = await getPosts();
        if (!res) {
            console.error("Error response from backend is null");
            return;
        }
        console.log(res);
    }

    const handleGetMyUsers = async () => {
        const res = await getMyUsers();
        if (!res) {
            console.error("Error response from backend is null");
            return;
        }
        console.log(res);
    }

    return (
        <div className="App">
            <div style={{display: 'flex', justifyContent: 'center', height: '50px'}}>
                {currentAccount === "" ? walletNotConnected() : walletConnected()}
                <br/>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', height: '50px'}}>
                <button
                    onClick={signMessage}
                    className="connect-to-wallet-button">
                    Login
                </button>
                <br/>
            </div>
            <button
                onClick={handleCheckAuth}
                className="connect-to-wallet-button">
                Check Auth
            </button>
            <div style={{display: 'block', justifyContent: 'center', height: '500px'}}>
                <div style={{width: 100 + 'vw', height: 10 + 'vh', margin: "50px 0 0 0"}}>
                    Create User
                    <form onSubmit={handleCreateUserSubmit}>
                        <label>
                            Name:
                            <input type="text" name="name"/>
                        </label>
                        <label>
                            Email:
                            <input type="text" name="email"/>
                        </label>
                        <label>
                            Price:
                            <input type="text" name="price"/>
                        </label>
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
                <div style={{width: 100 + 'vw', height: 10 + 'vh', margin: "50px 0 0 0"}}>
                    Get my users
                    <button
                        onClick={handleGetMyUsers}
                        className="connect-to-wallet-button">
                        Get my users
                    </button>
                </div>
                <div style={{width: 100 + 'vw', height: 10 + 'vh'}}>
                    Create Post
                    <form onSubmit={handleCreatePostSubmit}>
                        <label>
                            Title:
                            <input type="text" name="title"/>
                        </label>
                        <label>
                            Content:
                            <input type="text" name="content"/>
                        </label>
                        <label>
                            Price:
                            <input type="text" name="price"/>
                        </label>
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
                <div style={{width: 100 + 'vw', height: 10 + 'vh'}}>
                    Get Posts
                    <button
                        onClick={handleGetPosts}
                        className="connect-to-wallet-button">
                        Get Posts
                    </button>
                </div>
                <div style={{width: 100 + 'vw', height: 10 + 'vh'}}>
                    Buy Post
                    <form onSubmit={handleBuyPost}>
                        <label>
                            Post Address:
                            <input type="text" name="postAddress"/>
                        </label>
                        <label>
                            Price:
                            <input type="text" name="price"/>
                        </label>
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
                <div style={{width: 100 + 'vw', height: 10 + 'vh'}}>
                    Update Username
                    <form onSubmit={handleUpdateUsername}>
                        <label>
                            Name:
                            <input type="text" name="name"/>
                        </label>
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
                <div style={{width: 100 + 'vw', height: 10 + 'vh'}}>
                    Update Email
                    <form onSubmit={handleUpdateEmail}>
                        <label>
                            Email:
                            <input type="text" name="email"/>
                        </label>
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
                <div style={{width: 100 + 'vw', height: 10 + 'vh'}}>
                    Transfer User Ownership
                    <form onSubmit={handleTransferUserOwnership}>
                        <label>
                            Address:
                            <input type="text" name="address"/>
                        </label>
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
                <div style={{width: 100 + 'vw', height: 10 + 'vh'}}>
                    Buy User
                    <form onSubmit={handleBuyUser}>
                        <label>
                            Address:
                            <input type="text" name="address"/>
                        </label>
                        <label>
                            Price:
                            <input type="text" name="price"/>
                        </label>
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
                <div style={{width: 100 + 'vw', height: 10 + 'vh'}}>
                    Follow User
                    <form onSubmit={handleFollowUser}>
                        <label>
                            Address:
                            <input type="text" name="address"/>
                        </label>
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
                <div style={{width: 100 + 'vw', height: 10 + 'vh'}}>
                    Change Price Post
                    <form onSubmit={handleChangePricePost}>
                        <label>
                            Address:
                            <input type="text" name="address"/>
                        </label>
                        <label>
                            Price:
                            <input type="text" name="price"/>
                        </label>
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
                <div style={{width: 100 + 'vw', height: 10 + 'vh'}}>
                    Like Post
                    <form onSubmit={handleLikePost}>
                        <label>
                            Address:
                            <input type="text" name="address"/>
                        </label>
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default App;
