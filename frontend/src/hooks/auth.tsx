import { useContext } from 'react';
import { AuthContext, IAuthContext } from '../context/AuthContext';

export default function useAuth(): IAuthContext {
  const context = useContext(AuthContext);

  return context;
}
