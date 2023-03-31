import axios from 'axios'
const API = "http://localhost:4000/api"
export const authenticate = (data, next) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("jwt", JSON.stringify({expires_in: Date.now() + 24*60*60*1000, data}))
        next();
    }
}

export const isAuthenticated = () => {

    if (typeof window == "undefined") {
        return false
    }
    if (localStorage.getItem("jwt")) {
        const {expires_in, data} = JSON.parse(localStorage.getItem("jwt"))
        
        if(Date.now() > expires_in){
            localStorage.removeItem("jwt")
            return false
        }
        return data;
    }
    else {
        return false
    }
}


export const signup = async (data) =>{
        return await axios.post(`${API}/auth/signup`, data)       
}

export const login = async (data) =>{
        return await axios.post(`${API}/auth/login`, data)
        .then(res => {
            if(res.data?.success){
                // save token to local storage
                authenticate(res.data?.token,()=>{})
            }
            return res
        })       
}

export const logout = async () =>{
        return await axios.post(`${API}/auth/logout`)
        .then(res => {
            if(res.data?.success){
                if (typeof window !== "undefined") {
                    localStorage.removeItem("jwt")
                }
            }
            return res
        })       
}