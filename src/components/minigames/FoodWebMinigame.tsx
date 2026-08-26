import { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import './Minigames.css'; // We'll create this later or just use inline styles for now

type NodeId = 'undergrowth' | 'beetle' | 'bird';

interface Node {
  id: NodeId;
  label: string;
  emoji: string;
}

const NODES: Node[] = [
  { id: 'undergrowth', label: 'Undergrowth', emoji: '🌿' },
  { id: 'beetle', label: 'Beetle', emoji: '🪲' },
  { id: 'bird', label: 'Bird', emoji: '🐦' },
];

export function FoodWebMinigame() {
  const { closeModal, addUnderstanding, addXP, setF02FoodWebDone } = useGameStore();
  const [connections, setConnections] = useState<{from: NodeId, to: NodeId}[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Check if player made correct connections: undergrowth -> beetle, beetle -> bird
    const hasUB = connections.some(c => c.from === 'undergrowth' && c.to === 'beetle');
    const hasBB = connections.some(c => c.from === 'beetle' && c.to === 'bird');

    if (hasUB && hasBB && connections.length === 2 && !completed) {
      setCompleted(true);
      setTimeout(() => {
        addUnderstanding(15);
        addXP(30);
        setF02FoodWebDone();
        closeModal();
      }, 2000);
    }
  }, [connections, completed, addUnderstanding, addXP, setF02FoodWebDone, closeModal]);

  const handleNodeClick = (id: NodeId) => {
    if (completed) return;
    
    if (selectedNode === null) {
      setSelectedNode(id);
    } else {
      if (selectedNode !== id) {
        // Create connection
        setConnections(prev => {
          // Check if it already exists
          if (prev.some(c => c.from === selectedNode && c.to === id)) return prev;
          return [...prev, { from: selectedNode, to: id }];
        });
      }
      setSelectedNode(null);
    }
  };

  const handleReset = () => {
    setConnections([]);
    setSelectedNode(null);
  };

  return (
    <div className="modal-overlay" onClick={completed ? () => {} : closeModal}>
      <div className="minigame-box glass" onClick={(e) => e.stopPropagation()}>
        <h2>Rebuild the Food Web</h2>
        <p>A forest isn't just a collection of trees. Select a node, then click another to connect them.</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-around', margin: '30px 0' }}>
          {NODES.map(node => (
            <div 
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: selectedNode === node.id ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '2rem' }}>{node.emoji}</span>
              <span style={{ fontSize: '0.75rem', marginTop: 4 }}>{node.label}</span>
            </div>
          ))}
        </div>

        <div style={{ minHeight: 60, textAlign: 'center', marginBottom: 20 }}>
          {connections.length > 0 && (
            <div>
              <p>Connections:</p>
              {connections.map((c, i) => (
                <div key={i}>{c.from} → {c.to}</div>
              ))}
            </div>
          )}
          {completed && <div style={{ color: '#22c55e', fontWeight: 'bold', marginTop: 10 }}>Food web restored! (+30 XP)</div>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={handleReset}>Reset</button>
          <button className="btn btn-primary" onClick={closeModal}>Leave</button>
        </div>
      </div>
    </div>
  );
}
