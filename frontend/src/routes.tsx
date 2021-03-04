import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Redirect, Route, RouteChildrenProps, Switch } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import useAuth from './hooks/auth';
import routes from "./configs/route";
import DefaultLayout from "./layouts/DefaultLayout";
import NotAuthorized from "./pages/NotAuthorized";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

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
        {isLoggedIn ? (
          <DefaultLayout>
            <TransitionGroup>
              <Switch>
                {routes?.map(({ path, scopes, Component }) => (
                  <Route
                    key={path}
                    exact
                    path={`${process.env.PUBLIC_URL}${path}`}
                    children={(props: RouteChildrenProps<any>) => {
                      if (scopes) {
                        if (!hasAnyPermissions(scopes))
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
