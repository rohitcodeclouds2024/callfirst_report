"use client";
import { useState } from "react";
import {
  FaSyncAlt,
  FaExclamationTriangle,
  FaBox,
  FaClipboardList,
} from "react-icons/fa";
import "./../../../i18n";
import { notify } from "./../../../components/Toaster";
export default function UIPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-6 space-y-8">
      <h1 className="h1">UI Reference Page</h1>

      {/* Buttons */}
      <section>
        <h2 className="h2 mb-4">Buttons</h2>
        <div className="space-x-2">
          <button className="btn">Primary</button>
          <button className="btn-secondary">Secondary</button>
          <button className="btn-accent">Accent</button>
          <button className="btn-outline">Outline</button>
          <button className="btn-disabled" disabled>
            Disabled
          </button>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="h2 mb-4">Inputs</h2>
        <div className="space-y-4">
          <input className="input" placeholder="Text input" />
          <textarea className="textarea" placeholder="Textarea"></textarea>
          <select className="select">
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
          <div className="space-x-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="checkbox" />
              <span>Checkbox</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="radio" className="radio" />
              <span>Radio</span>
            </label>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section>
        <h2 className="h2 mb-4">Alerts</h2>
        <div className="space-y-2">
          <div className="alert-success">Success Alert</div>
          <div className="alert-error">Error Alert</div>
          <div className="alert-warning">Warning Alert</div>
          <div className="alert-info">Info Alert</div>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="h2 mb-4">Badges</h2>
        <div className="space-x-2">
          <span className="badge-success">Success</span>
          <span className="badge-error">Error</span>
          <span className="badge-warning">Warning</span>
          <span className="badge-info">Info</span>
        </div>
      </section>

      {/* Avatar */}
      <section>
        <h2 className="h2 mb-4">Avatar</h2>
        <div className="avatar">
          <img src="https://i.pravatar.cc/100" alt="avatar" />
        </div>
      </section>

      {/* Tabs */}
      <section>
        <h2 className="h2 mb-4">Tabs</h2>
        <div className="tabs">
          <div className="tab tab-active">Tab 1</div>
          <div className="tab">Tab 2</div>
          <div className="tab">Tab 3</div>
        </div>
      </section>

      {/* Table */}
      <section>
        <h2 className="h2 mb-4">Table</h2>
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Alice</td>
              <td>
                <span className="badge-success">Active</span>
              </td>
              <td>Admin</td>
            </tr>
            <tr>
              <td>Bob</td>
              <td>
                <span className="badge-error">Banned</span>
              </td>
              <td>User</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Cards */}
      <section>
        <h2 className="h2 mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="card-header">Card Title</div>
            <div className="card-body">Basic Card Body</div>
          </div>
          <div className="card-hover">
            <div className="card-header">Hover Card</div>
            <div className="card-body">Hover effect applied</div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <section>
        <h2 className="h2 mb-4">Modal Example</h2>
        <button className="btn" onClick={() => setShowModal(true)}>
          Open Modal
        </button>

        {showModal && (
          <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="modal bg-white rounded-lg p-6 w-96 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
              <h3 className="card-header mb-2">Modal Title</h3>
              <p className="card-body">This is an example modal.</p>
            </div>
          </div>
        )}
      </section>

      {/* Loader */}
      <section>
        <h2 className="h2 mb-4">Loader</h2>
        <div className="loader"></div>
      </section>
    </div>
  );
}
