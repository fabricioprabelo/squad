import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Redirect, Route, RouteChildrenProps, Switch } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import useAuth from './hooks/auth';
import routes from "./configs/route";
import DefaultLayout from "./layouts/DefaultLayout";
import NotAuthorized from "./pages/Errors/NotAuthorized";
import NotFound from "./pages/Errors/NotFound";
import Login from "./pages/Authentication/Login";
import ForgotPassword from "./pages/Authentication/ForgotPassword";
import ResetPassword from "./pages/Authentication/ResetPassword";
import Register from "./pages/Authentication/Register";

export default function Routes() {
  const isMountedRef = useRef(false);
  const { isLoggedIn, hasAnyPermissions } = useAuth();
  const [animation, setAnimation] = useState("fade");

  useEffect(() => {
    isMountedRef.current = true;
    if (isMountedRef.current)
      setAnimation(animation);
    return () => { isMountedRef.current = false };
  }, [animation]);

  return (
    <BrowserRouter basename="/">
      <Switch>
        <Route path={`${process.env.PUBLIC_URL}/login`} exact component={Login} />
        <Route path={`${process.env.PUBLIC_URL}/forgot-password`} exact component={ForgotPassword} />
        <Route path={`${process.env.PUBLIC_URL}/reset-password`} exact component={ResetPassword} />
        <Route path={`${process.env.PUBLIC_URL}/register`} exact component={Register} />
        {isLoggedIn ? (
          <DefaultLayout>
            <TransitionGroup>
              <Switch>
                {routes?.map(({ path, permissions, Component }) => (
                  <Route
                    key={path}
                    exact
                    path={`${process.env.PUBLIC_URL}${path}`}
                    children={(props: RouteChildrenProps<any>) => {
                      if (permissions) {
                        if (!hasAnyPermissions(permissions))
                          return (
                            <CSSTransition
                              in={props.match !== null}
                              timeout={100}
                              classNames={animation}
                              unmountOnExit
                            >
                              <div>
                                <NotAuthorized />
                              </div>
                            </CSSTransition>
                          );
                      }
                      return (
                        <CSSTransition
                          in={props.match !== null}
                          timeout={100}
                          classNames={animation}
                          unmountOnExit
                        >
                          <div>
                            <Component {...props} />
                          </div>
                        </CSSTransition>
                      );
                    }}
                  />
                ))}
                <Route component={NotFound} />
              </Switch>
            </TransitionGroup>
          </DefaultLayout>
        ) : <Redirect to={`${process.env.PUBLIC_URL}/login`} />}
      </Switch>
    </BrowserRouter>
  );
}
