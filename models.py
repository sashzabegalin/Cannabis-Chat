from datetime import datetime
from app import db

class Strain(db.Model):
    """Model for cannabis strains."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    type = db.Column(db.String(20), nullable=False)  # Indica, Sativa, Hybrid
    thc_content = db.Column(db.String(20))
    cbd_content = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class StrainEffect(db.Model):
    """Model for strain effects (many-to-many relationship)."""
    id = db.Column(db.Integer, primary_key=True)
    strain_id = db.Column(db.Integer, db.ForeignKey('strain.id'), nullable=False)
    effect = db.Column(db.String(50), nullable=False)  # Relaxed, Happy, Euphoric, etc.

class StrainFlavor(db.Model):
    """Model for strain flavors (many-to-many relationship)."""
    id = db.Column(db.Integer, primary_key=True)
    strain_id = db.Column(db.Integer, db.ForeignKey('strain.id'), nullable=False)
    flavor = db.Column(db.String(50), nullable=False)  # Berry, Sweet, Earthy, etc.

class UserPreference(db.Model):
    """Model for storing user preferences and interaction history."""
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), nullable=False)
    preferred_type = db.Column(db.String(20))
    preferred_effect = db.Column(db.String(50))
    preferred_flavor = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Recommendation(db.Model):
    """Model for tracking strain recommendations."""
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), nullable=False)
    strain_id = db.Column(db.Integer, db.ForeignKey('strain.id'), nullable=False)
    rating = db.Column(db.Integer)  # Optional user rating
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    strain = db.relationship('Strain', backref=db.backref('recommendations', lazy=True))
