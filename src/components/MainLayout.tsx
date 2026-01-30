// layouts/MainLayout.tsx
import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Layout as AntLayout, Menu } from "antd";
import { BookOutlined, PlusOutlined, HomeOutlined } from "@ant-design/icons";
import { StudySetForm } from "./StudySetForm";

const { Header, Content, Footer } = AntLayout;

export default function MainLayout() {
  const location = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  return (
    <AntLayout className="min-h-screen">
      {/* Header */}
      <Header className="flex items-center justify-between bg-slate-900 px-6">
        {/* Logo */}
        <div className="text-white text-xl font-semibold mr-8 whitespace-nowrap">
          Language Learning
        </div>

        {/* Menu */}
        <Menu
          mode="horizontal"
          theme="dark"
          selectedKeys={[location.pathname]}
          className="flex-1 justify-end bg-transparent border-none"
          items={[
            {
              key: "/",
              icon: <HomeOutlined />,
              label: <Link to="/">Home</Link>,
            },
            {
              key: "/study-sets",
              icon: <BookOutlined />,
              label: <Link to="/study-sets">Discover</Link>,
            },
            {
              key: "/my-study-sets",
              icon: <BookOutlined />,
              label: <Link to="/my-study-sets">My Lessons</Link>,
            },
            {
              key: "/create",
              icon: <PlusOutlined />,
              label: <a href="#" onClick={handleCreateClick}>Create</a>,
            },
          ]}
        />
      </Header>

      {/* Main content */}
      <Content className="flex-1 bg-slate-50 px-6 py-6">
        <Outlet />
      </Content>

      {/* Footer */}
      <Footer className="text-center text-sm text-gray-500">
        Language Learning Platform © 2024
      </Footer>

      {/* Create Form Modal */}
      <StudySetForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
      />
    </AntLayout>
  );
}
