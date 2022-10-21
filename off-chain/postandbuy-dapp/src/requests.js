// get jwt token from backend and return it to the frontend
import axios from "axios";

export function login(signature, address, message) {
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

export function createUser(name, email, price) {
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

export function createPost(title, content, price) {
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

export function checkAuth() {
    return axios.get('http://localhost:8000/check-auth').then(res => {
        console.log(res);
        return res;
    }).catch(err => {
        console.error(err);
    });
}

export function buyPost(postAddress, price) {
    return axios.post('http://localhost:8000/buy-post', {
        postAddress: postAddress,
        price: price
    }).then(res => {
        console.log(res);
        return res;
    }).catch(err => {
        console.error(err);
    });
}

export function updateUsername(username) {
    return axios.post('http://localhost:8000/update-username', {
        name: username
    }).then(res => {
        console.log(res);
        return res;
    }).catch(err => {
        console.error(err);
    });
}

export function updateEmail(email) {
    return axios.post('http://localhost:8000/update-email', {
        email: email
    }).then(res => {
        console.log(res);
        return res;
    }).catch(err => {
        console.error(err);
    });
}

export function transferUserOwnership(newOwner) {
    return axios.post('http://localhost:8000/transfer-user-ownership', {
        newOwner: newOwner,
    }).then(res => {
        console.log(res);
        return res;
    }).catch(err => {
        console.error(err);
    });

}

export function buyUser(addressToBuy, price) {
    return axios.post('http://localhost:8000/buy-user', {
        addressToBuy: addressToBuy,
        price: price
    }).then(res => {
        console.log(res);
        return res;
    }).catch(err => {
        console.error(err);
    });

}

export function followUser(userAddressToFollow) {
    return axios.post('http://localhost:8000/follow-user', {
        addressToFollow: userAddressToFollow
    }).then(res => {
        console.log(res);
        return res;
    }).catch(err => {
        console.error(err);
    });
}

export function changePricePost(postAddress, newPrice) {
    return axios.post('http://localhost:8000/post-change-price', {
        postAddress: postAddress,
        price: newPrice
    }).then(res => {
        console.log(res);
        return res;
    }).catch(err => {
        console.error(err);
    });
}

export function likePost(postAddress) {
    return axios.post('http://localhost:8000/like-post', {
        postAddress: postAddress
    }).then(res => {
        console.log(res);
        return res;
    }).catch(err => {
        console.error(err);
    });
}
