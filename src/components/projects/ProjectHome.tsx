import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Project, ProjectMember, AgreementItem } from '../../types';
import { MonogramSeal } from '../common/MonogramSeal';
import { ArrowLeft, Users, Calendar, MapPin, FileSignature, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProjectHomeProps {
  projectId: string;
  onBackToProjects: () => void;
  onEnterProjectSpace: () => void;
}

export const ProjectHome: React.FC<ProjectHomeProps> = ({
  projectId,
  onBackToProjects,
  onEnterProjectSpace,
}) => {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [agreements, setAgreements] = useState<AgreementItem[]>([]);
  const [userRole, setUserRole] = useState<'owner' | 'member' | 'viewer'>('viewer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const data = await api.getProject(projectId);
      setProject(data.project);
      setMembers(data.members || []);
      setUserRole(data.userRole || 'viewer');

      const agreeData = await api.getAgreements(projectId);
      setAgreements(agreeData.agreements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isCovenantSignedByMe = Boolean(
    user && agreements.length > 0 && agreements.every((a) => a.signed_by?.some((s) => s.user_id === user.id))
  );
  const isCovenantRatified = Boolean(
    agreements.length > 0 && agreements.every((a) => a.status === 'agreed')
  );

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-wv-dirtywhite/50 animate-pulse">
        Retrieving project catalog...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="font-display font-medium text-lg text-wv-ivory">Project Not Found</p>
        <button
          onClick={onBackToProjects}
          className="btn-editorial py-2 px-4 text-xs cursor-pointer"
        >
          &larr; Back to Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-8 space-y-6 max-w-4xl mx-auto w-full animate-editorial-fade">
      {/* Top Folio Breadcrumb */}
      <div className="border-b border-wv-charcoal pb-3 flex items-center justify-between">
        <button
          onClick={onBackToProjects}
          className="flex items-center gap-1.5 font-sans text-xs uppercase tracking-wider text-wv-dirtywhite/60 hover:text-wv-ivory cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Workspace</span>
        </button>
        <span className="font-mono text-[10px] text-wv-dustyrose uppercase tracking-widest">
          Project Cover
        </span>
      </div>

      {/* Stage 2: Cover Composition (Artist Monograph Style) */}
      <div className="border border-wv-charcoal bg-wv-charcoal/40 p-6 space-y-6 relative overflow-hidden ">
        {/* Subtle Dusty Rose Monograph Field */}
        <div
          className="absolute top-0 right-0 w-36 h-36 bg-wv-dustyrose/5 pointer-events-none"
          style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' }}
        />

        {/* Badges & Role */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-wv-black border border-wv-charcoal text-wv-dustyrose">
              {project.project_type}
            </span>
            <span className="font-mono text-[10px] uppercase px-2 py-0.5 border border-wv-charcoal text-wv-dirtywhite/70">
              {project.status || 'Active'}
            </span>
          </div>
          <span className="font-mono text-[10px] text-wv-dirtywhite/60 uppercase">
            [{userRole}]
          </span>
        </div>

        {/* Project Title & Logline */}
        <div className="space-y-3 relative z-10">
          <h1 className="font-display font-medium text-3xl sm:text-4xl text-wv-ivory leading-tight tracking-normal">
            {project.title}
          </h1>

          <div className="w-12 h-[2px] bg-wv-dustyrose" />

          {project.description && (
            <p className="font-serif text-base text-wv-dirtywhite/90 leading-relaxed italic font-normal">
              {project.description}
            </p>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-wv-charcoal font-sans text-xs text-wv-dirtywhite/70 relative z-10">
          {project.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-wv-dustyrose shrink-0" />
              <span>{project.location}</span>
            </div>
          )}
          {project.target_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-wv-dustyrose shrink-0" />
              <span className="font-mono text-[11px]">{project.target_date}</span>
            </div>
          )}
        </div>

        {/* Stage 06: Protect / Covenant Status Banner */}
        <div className="pt-4 border-t border-wv-charcoal relative z-10">
          <div className="p-3 bg-wv-black/70 border border-wv-charcoal flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-wv-dustyrose shrink-0" />
              <div>
                <span className="font-mono text-[10px] uppercase text-wv-dirtywhite/70 block">
                  STAGE 06 : PROTECT &middot; COVENANT STATUS
                </span>
                <span className="font-mono text-xs font-bold text-wv-ivory">
                  {isCovenantRatified ? (
                    <span className="text-[#2D7A4C] flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> COVENANT RATIFIED
                    </span>
                  ) : isCovenantSignedByMe ? (
                    <span className="text-wv-dustyrose flex items-center gap-1">
                      <FileSignature className="w-3.5 h-3.5" /> SIGNED BY YOU &middot; PENDING CREW
                    </span>
                  ) : (
                    <span className="text-[#C84B31] flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> SIGNATURE REQUIRED BEFORE PRODUCTION
                    </span>
                  )}
                </span>
              </div>
            </div>
            {!isCovenantSignedByMe && (
              <button
                onClick={onEnterProjectSpace}
                className="font-mono text-[10px] text-wv-dustyrose hover:underline uppercase font-bold text-left cursor-pointer"
              >
                Sign in Project Space &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Collaborators / Crew Roster */}
        <div className="pt-4 border-t border-wv-charcoal space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] uppercase tracking-wider text-wv-dirtywhite/60 font-medium">
              Collaborators ({members.length})
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2.5 bg-wv-black/50 border border-wv-charcoal"
              >
                <div className="flex items-center gap-2.5">
                  <MonogramSeal name={m.name} size="xs" />
                  <div>
                    <span className="font-sans font-medium text-xs text-wv-ivory block">
                      {m.name}
                    </span>
                    <span className="font-serif italic text-[11px] text-wv-dustyrose">
                      {m.role || 'Contributor'}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 border border-wv-charcoal text-wv-dirtywhite/50">
                  {m.role === 'owner' ? 'Lead' : 'Member'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Big Prominent Stage Transition Button */}
        <div className="pt-4 border-t border-wv-charcoal relative z-10">
          <button
            onClick={onEnterProjectSpace}
            className="w-full btn-editorial-poster text-center flex items-center justify-center gap-2 cursor-pointer "
          >
            <span>ENTER PROJECT SPACE</span>
            <span className="text-lg leading-none">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
