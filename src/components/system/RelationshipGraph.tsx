import React, { useEffect, useRef, useState } from 'react';
import { 
  EntityType, 
  RelationshipType,
  entityRelationships,
  getEntityRelationships,
  getRelatedEntities
} from '@/lib/relations/entity-relations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

// This is a placeholder for a real graph visualization library
// In a real implementation, you would use a library like d3.js, vis.js, or react-flow
const RelationshipGraphVisualization: React.FC<{
  entityType: EntityType | null;
  showDirectRelationsOnly: boolean;
  relationshipTypes: RelationshipType[];
}> = ({ entityType, showDirectRelationsOnly, relationshipTypes }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw a simple representation of the graph
  useEffect(() => {
    if (!canvasRef.current || !entityType) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get relationships for the selected entity
    let relationships = getEntityRelationships(entityType);
    
    // Filter by relationship types if specified
    if (relationshipTypes.length > 0) {
      relationships = relationships.filter(rel => relationshipTypes.includes(rel.type));
    }
    
    // Get related entities
    const relatedEntities = getRelatedEntities(entityType);
    
    // Define colors for different relationship types
    const colors = {
      [RelationshipType.ONE_TO_ONE]: '#3b82f6', // blue
      [RelationshipType.ONE_TO_MANY]: '#10b981', // green
      [RelationshipType.MANY_TO_MANY]: '#8b5cf6', // purple
    };
    
    // Define entity positions (in a real implementation, you would use a layout algorithm)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 50;
    
    // Draw the main entity in the center
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#f97316'; // orange
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(entityType, centerX, centerY);
    
    // Draw related entities in a circle around the main entity
    if (relatedEntities.length > 0) {
      const angleStep = (2 * Math.PI) / relatedEntities.length;
      
      relatedEntities.forEach((relEntity, index) => {
        const angle = index * angleStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        // Draw entity circle
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, 2 * Math.PI);
        ctx.fillStyle = '#64748b'; // slate
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(relEntity, x, y);
        
        // Draw relationships between entities
        const directRelationships = relationships.filter(
          rel => (rel.sourceEntity === entityType && rel.targetEntity === relEntity) ||
                (rel.targetEntity === entityType && rel.sourceEntity === relEntity)
        );
        
        directRelationships.forEach(rel => {
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = colors[rel.type];
          ctx.lineWidth = 2;
          
          // Draw different line styles based on relationship type
          if (rel.type === RelationshipType.ONE_TO_ONE) {
            ctx.setLineDash([]);
          } else if (rel.type === RelationshipType.ONE_TO_MANY) {
            ctx.setLineDash([5, 3]);
          } else {
            ctx.setLineDash([2, 2]);
          }
          
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Draw relationship type indicator at the midpoint
          const midX = (centerX + x) / 2;
          const midY = (centerY + y) / 2;
          
          ctx.beginPath();
          ctx.arc(midX, midY, 10, 0, 2 * Math.PI);
          ctx.fillStyle = colors[rel.type];
          ctx.fill();
          
          // Add a letter to indicate the relationship type
          ctx.fillStyle = 'white';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const typeIndicator = 
            rel.type === RelationshipType.ONE_TO_ONE ? '1:1' :
            rel.type === RelationshipType.ONE_TO_MANY ? '1:N' : 
            'N:M';
          
          ctx.fillText(typeIndicator, midX, midY);
        });
      });
    }
    
    // Draw legend
    const legendX = 20;
    let legendY = 20;
    const legendSpacing = 25;
    
    // Title
    ctx.fillStyle = 'black';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Relationship Types:', legendX, legendY);
    legendY += legendSpacing;
    
    // One-to-One
    ctx.beginPath();
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 30, legendY);
    ctx.strokeStyle = colors[RelationshipType.ONE_TO_ONE];
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText('One-to-One (1:1)', legendX + 40, legendY);
    legendY += legendSpacing;
    
    // One-to-Many
    ctx.beginPath();
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 30, legendY);
    ctx.strokeStyle = colors[RelationshipType.ONE_TO_MANY];
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText('One-to-Many (1:N)', legendX + 40, legendY);
    legendY += legendSpacing;
    
    // Many-to-Many
    ctx.beginPath();
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 30, legendY);
    ctx.strokeStyle = colors[RelationshipType.MANY_TO_MANY];
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText('Many-to-Many (N:M)', legendX + 40, legendY);
    
  }, [entityType, showDirectRelationsOnly, relationshipTypes]);
  
  if (!entityType) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-md">
        <p className="text-muted-foreground">Select an entity to view its relationships</p>
      </div>
    );
  }
  
  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={500} 
      className="w-full h-[400px] border rounded-md"
    />
  );
};

export const RelationshipGraph: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<EntityType | null>(null);
  const [showDirectRelationsOnly, setShowDirectRelationsOnly] = useState(true);
  const [selectedRelationshipTypes, setSelectedRelationshipTypes] = useState<RelationshipType[]>([
    RelationshipType.ONE_TO_ONE,
    RelationshipType.ONE_TO_MANY,
    RelationshipType.MANY_TO_MANY,
  ]);
  
  const handleRelationshipTypeChange = (type: RelationshipType, checked: boolean) => {
    if (checked) {
      setSelectedRelationshipTypes(prev => [...prev, type]);
    } else {
      setSelectedRelationshipTypes(prev => prev.filter(t => t !== type));
    }
  };
  
  const entityOptions = Object.values(EntityType);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Entity Relationship Graph</CardTitle>
        <CardDescription>
          Visualize relationships between different entities in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="entity-select">Select Entity</Label>
            <Select 
              value={selectedEntity || ''} 
              onValueChange={(value) => setSelectedEntity(value as EntityType)}
            >
              <SelectTrigger id="entity-select">
                <SelectValue placeholder="Select an entity" />
              </SelectTrigger>
              <SelectContent>
                {entityOptions.map((entity) => (
                  <SelectItem key={entity} value={entity}>
                    {entity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Relationship Types</Label>
            <div className="flex flex-col space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="one-to-one"
                  checked={selectedRelationshipTypes.includes(RelationshipType.ONE_TO_ONE)}
                  onCheckedChange={(checked) => 
                    handleRelationshipTypeChange(RelationshipType.ONE_TO_ONE, checked === true)
                  }
                />
                <Label htmlFor="one-to-one" className="text-sm">
                  One-to-One (1:1)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="one-to-many"
                  checked={selectedRelationshipTypes.includes(RelationshipType.ONE_TO_MANY)}
                  onCheckedChange={(checked) => 
                    handleRelationshipTypeChange(RelationshipType.ONE_TO_MANY, checked === true)
                  }
                />
                <Label htmlFor="one-to-many" className="text-sm">
                  One-to-Many (1:N)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="many-to-many"
                  checked={selectedRelationshipTypes.includes(RelationshipType.MANY_TO_MANY)}
                  onCheckedChange={(checked) => 
                    handleRelationshipTypeChange(RelationshipType.MANY_TO_MANY, checked === true)
                  }
                />
                <Label htmlFor="many-to-many" className="text-sm">
                  Many-to-Many (N:M)
                </Label>
              </div>
            </div>
          </div>
          
          <div>
            <Label>Display Options</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="direct-relations"
                checked={showDirectRelationsOnly}
                onCheckedChange={(checked) => setShowDirectRelationsOnly(checked === true)}
              />
              <Label htmlFor="direct-relations" className="text-sm">
                Show direct relations only
              </Label>
            </div>
          </div>
        </div>
        
        {selectedEntity && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Related Entities:</h3>
            <div className="flex flex-wrap gap-2">
              {getRelatedEntities(selectedEntity).map((entity) => (
                <Badge key={entity} variant="outline">
                  {entity}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <RelationshipGraphVisualization 
          entityType={selectedEntity}
          showDirectRelationsOnly={showDirectRelationsOnly}
          relationshipTypes={selectedRelationshipTypes}
        />
        
        {selectedEntity && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              Note: This is a simplified visualization. In a production environment, 
              consider using a dedicated graph visualization library for more interactive features.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RelationshipGraph;
