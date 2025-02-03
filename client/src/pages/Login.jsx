import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContent";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
    const navigate = useNavigate();

    const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContent);

    const [userState, setUserState] = useState('Sign Up');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();

            axios.defaults.withCredentials = true;

            if (userState === 'Sign Up') {
                const {data} = await axios.post(backendUrl + '/api/auth/register', {
                    name: userName,
                    email: userEmail,
                    password: userPassword
                });
                if (data.success) {
                    setIsLoggedIn(true);
                    getUserData();
                    navigate('/');
                } else {
                    toast.error(data.message);
                }
            } else {
                const {data} = await axios.post(backendUrl + '/api/auth/login', {
                    email: userEmail,
                    password: userPassword
                });

                if (data.success) {
                    setIsLoggedIn(true);
                    getUserData();
                    navigate('/');
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
            <img src={assets.logo} alt="logo" className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
                onClick={() => navigate('/')} />

            <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
                <h2 className="text-3xl font-semibold text-white text-center mb-3">{userState === 'Sign Up' ? 'Create account' : 'Login'}</h2>

                <p className="text-center text-sm mb-6">{userState === 'Sign Up' ? 'Create a new account' : 'Login to your account'}
                </p>

                <form onSubmit={onSubmitHandler}>
                    {
                        userState === 'Sign Up' &&
                        <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                            <img src={assets.person_icon} alt="person" />
                            <input type="text" className="bg-transparent outline-none" placeholder="Username"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                        </div>
                    }

                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                        <img src={assets.mail_icon} alt="mail" />
                        <input type="email" className="bg-transparent outline-none" placeholder="Email Id"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                        />
                    </div>

                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                        <img src={assets.lock_icon} alt="password" />
                        <input type="password" className="bg-transparent outline-none" placeholder="Password"
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                        />
                    </div>

                    <p className="mb-4 text-indigo-500 cursor-pointer"
                        onClick={() => navigate('/reset-password')}>Forgot Password?</p>

                    <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer">{userState}</button>

                    {
                        userState === 'Sign Up' ?
                            <p className="text-gray-400 text-center text-xs mt-4">
                                Already have an account?&nbsp; <span className="text-blue-400 cursor-pointer underline"
                                    onClick={() => setUserState('Login')}
                                >Login here</span>
                            </p>
                            :
                            <p className="text-gray-400 text-center text-xs mt-4">
                                Don't  have an account?&nbsp; <span className="text-blue-400 cursor-pointer underline"
                                    onClick={() => setUserState('Sign Up')}
                                >Sign Up</span>
                            </p>
                    }

                </form>
            </div>

        </div>
    )
}

export default Login