import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>테이블오더 관리자 대시보드</div>} />
      {/* Feature routes will be added here */}
    </Routes>
  );
}

export default App;
