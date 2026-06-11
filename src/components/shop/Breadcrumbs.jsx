import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Breadcrumbs.css';

const Breadcrumbs = ({ paths, current }) => {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {paths.map((path, index) => (
          <li key={index} className="breadcrumbs-item">
            <Link to={path.link} className="breadcrumbs-link">{path.name}</Link>
            <ChevronRight size={14} className="breadcrumbs-separator" />
          </li>
        ))}
        <li className="breadcrumbs-item" aria-current="page">
          <span className="breadcrumbs-current">{current}</span>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
