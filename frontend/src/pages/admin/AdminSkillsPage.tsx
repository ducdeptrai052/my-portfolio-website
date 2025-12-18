import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { fetchSkillsData, saveSkillsData, defaultSkillsData, SkillsData, SkillGroup, Skill } from '@/data/skills';
import { Save, Plus, Trash2, X } from 'lucide-react';

const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

function SkillGroupEditor({
  group,
  onUpdate,
  onDelete,
}: {
  group: SkillGroup;
  onUpdate: (group: SkillGroup) => void;
  onDelete: () => void;
}) {
  const [newSkill, setNewSkill] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const addSkill = () => {
    if (newSkill.trim()) {
      const skill: Skill = {
        id: `skill-${Date.now()}`,
        name: newSkill.trim(),
        level: 'intermediate',
      };
      onUpdate({ ...group, skills: [...group.skills, skill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillId: string) => {
    onUpdate({ ...group, skills: group.skills.filter((s) => s.id !== skillId) });
  };

  const updateSkillLevel = (skillId: string, level: Skill['level']) => {
    onUpdate({
      ...group,
      skills: group.skills.map((s) => (s.id === skillId ? { ...s, level } : s)),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex-1">
          <Input
            value={group.name}
            onChange={(e) => onUpdate({ ...group, name: e.target.value })}
            className="text-lg font-medium border-0 p-0 h-auto focus-visible:ring-0"
            placeholder="Group Name"
          />
        </div>
        <Button variant="ghost" size="icon" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {group.skills.map((skill) => (
            <div key={skill.id} className="flex items-center gap-1 bg-muted rounded-md pl-3 pr-1 py-1">
              <span className="text-sm">{skill.name}</span>
              <Select
                value={skill.level}
                onValueChange={(value) => updateSkillLevel(skill.id, value as Skill['level'])}
              >
                <SelectTrigger className="h-6 w-24 text-xs border-0 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map((level) => (
                    <SelectItem key={level} value={level} className="text-xs">
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => removeSkill(skill.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add skill..."
            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            className="flex-1"
          />
          <Button variant="outline" onClick={addSkill}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Skill Group"
        description={`Are you sure you want to delete "${group.name}" and all its skills?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={onDelete}
      />
    </Card>
  );
}

export default function AdminSkillsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<SkillsData>(defaultSkillsData);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkillsData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await saveSkillsData(data);
      setData(updated);
      toast({ title: 'Skills saved', description: 'Your skills have been updated.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save skills', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addGroup = () => {
    const newGroup: SkillGroup = {
      id: `group-${Date.now()}`,
      name: 'New Group',
      skills: [],
    };
    setData({ groups: [...data.groups, newGroup] });
  };

  const updateGroup = (index: number, group: SkillGroup) => {
    const newGroups = [...data.groups];
    newGroups[index] = group;
    setData({ groups: newGroups });
  };

  const deleteGroup = (index: number) => {
    setData({ groups: data.groups.filter((_, i) => i !== index) });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-serif font-medium">Skills</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-medium">Skills</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Add Group
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {data.groups.map((group, index) => (
          <SkillGroupEditor
            key={group.id}
            group={group}
            onUpdate={(g) => updateGroup(index, g)}
            onDelete={() => deleteGroup(index)}
          />
        ))}
      </div>

      {data.groups.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">No skill groups yet</p>
            <Button variant="outline" onClick={addGroup}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Group
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
