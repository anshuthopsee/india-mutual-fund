import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ChartWrapper from "./components/ChartWrapper";

function App() {
  
  return (
    <>
      <Routes>
        <Route path="/*" element={<Layout />}>
          <Route path="*" element={<ChartWrapper />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
