import React, { useState, useEffect } from 'react';
import { User, WorkspaceMember, UserRole } from '../types/auth';
import { useAuth } from './AuthProvider';

interface TeamManagementProps {
  workspaceId: string;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ workspaceId }) => {
  const { hasPermission } = useAuth();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('member');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, [workspaceId]);

  const loadMembers = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`);
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('team:invite')) {
      alert('You do not have permission to invite members');
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (response.ok) {
        setInviteEmail('');
        loadMembers();
      } else {
        alert('Failed to invite member');
      }
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const removeMember = async (userId: string) => {
    if (!hasPermission('team:remove')) {
      alert('You do not have permission to remove members');
      return;
    }

    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadMembers();
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const updateRole = async (userId: string, newRole: UserRole) => {
    if (!hasPermission('team:invite')) {
      alert('You do not have permission to update roles');
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        loadMembers();
      }
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading team members...</div>;
  }

  return (
    <div className="team-management">
      <h2>Team Management</h2>

      {hasPermission('team:invite') && (
        <form onSubmit={inviteMember} className="invite-form">
          <h3>Invite Member</h3>
          <input
            type="email"
            placeholder="Email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as UserRole)}>
            <option value="viewer">Viewer</option>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>
          <button type="submit">Send Invitation</button>
        </form>
      )}

      <div className="members-list">
        <h3>Members ({members.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.userId}>
                <td>
                  <div className="member-info">
                    {member.user.avatar && <img src={member.user.avatar} alt={member.user.name} />}
                    <span>{member.user.name}</span>
                  </div>
                </td>
                <td>{member.user.email}</td>
                <td>
                  {hasPermission('team:invite') ? (
                    <select
                      value={member.role}
                      onChange={(e) => updateRole(member.userId, e.target.value as UserRole)}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  ) : (
                    <span className={`role-badge role-${member.role}`}>{member.role}</span>
                  )}
                </td>
                <td>{new Date(member.joinedAt).toLocaleDateString()}</td>
                <td>
                  {hasPermission('team:remove') && member.role !== 'owner' && (
                    <button onClick={() => removeMember(member.userId)} className="btn-danger">
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .team-management {
          padding: 20px;
        }

        .invite-form {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .invite-form input,
        .invite-form select {
          margin: 10px 0;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.3);
          color: white;
        }

        .invite-form button {
          background: #00ff9f;
          color: #000;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .members-list table {
          width: 100%;
          border-collapse: collapse;
        }

        .members-list th,
        .members-list td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .member-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .member-info img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        .role-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }

        .role-owner {
          background: #ff0080;
          color: white;
        }

        .role-admin {
          background: #00ff9f;
          color: black;
        }

        .role-member {
          background: #00d4ff;
          color: black;
        }

        .role-viewer {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .btn-danger {
          background: #ff4444;
          color: white;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
