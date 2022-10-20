import './App.css';
import User from './contracts/User.json';
import Post from './contracts/Post.json';
import {useEffect, useState} from 'react';
import {withCookies, Cookies, useCookies} from 'react-cookie';
// import axios
import axios from 'axios';

// get jwt token from backend and return it to the frontend
function login(signature, address, message) {
    return axios.post('http://localhost:8000/login', {
        signature: signature,
        address: address,
        message: message
    }).then(res => {
        console.log(res);
        return res;
    }).catch(err => {
        console.error(err);
    });
}

function createUser(name, email, price) {
    return axios.post('http://localhost:8000/create-user', {
        name: name,
        email: email,
        price: price
    }).then(res => {
        console.log(res);
        return res;
    }).catch(err => {
        console.error(err);
    });
}

function createPost(title, content, price) {
    return axios.post('http://localhost:8000/create-post', {
        title: title,
        content: content,
        price: price
    }).then(res => {
        console.log(res);
        return res;
    }).catch(err => {
        console.error(err);
    });
}

function checkAuth() {
    return axios.get('http://localhost:8000/check-auth').then(res => {
        console.log(res);
        return res;
    }).catch(err => {
        console.error(err);
    });
}

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
                <div style={{width: 100 + 'vw', height: 20 + 'vh', margin: "50px 0 0 0"}}>
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
                <div style={{width: 100 + 'vw', height: 20 + 'vh'}}>
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
            </div>
        </div>
    );
};

export default App;
