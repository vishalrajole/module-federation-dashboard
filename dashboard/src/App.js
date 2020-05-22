import React, { useState, useEffect, lazy, Suspense } from "react";
import "./App.css";

const useDymanicScripts = (url) => {
  const [ready, setReady] = useState();
  const [failed, setFailed] = useState();

  useEffect(() => {
    if (!url) return;

    const element = document.createElement("script");
    element.src = url;
    element.type = "text/javascript";
    element.async = true;
    setReady(false);
    setFailed(false);

    element.onload = () => {
      console.log(`Dynamic script added: ${url}`);
      setReady(true);
    };
    element.onerror = () => {
      console.log(`Dynamic script error: ${url}`);
      setReady(false);
      setFailed(true);
    };
    document.head.appendChild(element);

    return () => {
      console.log(`Dynamic script removed: ${url}`);
      document.head.removeChild(element);
    };
  }, [url]);

  return {
    ready,
    failed,
  };
};

const RemoteReactComponent = ({ url, scope, module, ...props }) => {
  const { ready, failed } = useDymanicScripts(url);
  if (!ready) {
    return <h2>loading dymanic script: ${url}</h2>;
  }
  if (failed) {
    return <h2>failed to laod dymanic script: ${url}</h2>;
  }
  const Component = lazy(
    async () =>
      await window[scope].get(module).then((factory) => {
        const Module = factory();
        return Module;
      })
  );

  return (
    <Suspense fallback="Loading system">
      <Component {...props} />
    </Suspense>
  );
};

function App() {
  return (
    <div className="App">
      <RemoteReactComponent
        url="http://localhost:3001/graph1/remoteEntry.js"
        module="graph1mod"
        scope="graph1scope"
      ></RemoteReactComponent>
    </div>
  );
}

export default App;
