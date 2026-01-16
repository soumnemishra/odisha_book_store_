/**
 * Mongoose Soft Delete Plugin
 * Allows logical deletion of documents instead of physical removal
 * 
 * Usage:
 * schema.plugin(softDeletePlugin);
 * 
 * New Methods:
 * - model.softDelete(id, userId)
 * - model.restore(id)
 * - model.findDeleted()
 * - model.findWithDeleted()
 * 
 * Modified Behavior:
 * - find(), findOne(), etc. will exclude deleted documents by default
 */

import mongoose from 'mongoose';

export const softDeletePlugin = (schema) => {
    // Add Schema Fields
    schema.add({
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
        deletedBy: {
            type: mongoose.Schema.Types.Mixed, // Generic ID or Reference
            default: null,
        },
    });

    // Pre-find hooks to exclude deleted documents
    const operations = [
        'count',
        'countDocuments',
        'find',
        'findOne',
        'findOneAndUpdate',
        'update',
        'updateOne',
        'updateMany',
    ];

    /*
     * Hide deleted documents by default
     */
    operations.forEach((op) => {
        schema.pre(op, function (next) {
            if (this.options.includeDeleted !== true) {
                // Use $ne: true to include docs where isDeleted is false OR undefined
                this.where({ isDeleted: { $ne: true } });
            }
            next();
        });
    });

    /**
     * Soft delete a document
     * @param {string} id - Document ID
     * @param {string} userId - User performing the delete (optional)
     */
    schema.statics.softDelete = async function (id, userId = null) {
        const doc = await this.findById(id);
        if (!doc) return null;

        doc.isDeleted = true;
        doc.deletedAt = new Date();
        doc.deletedBy = userId;
        return doc.save();
    };

    /**
     * Restore a soft-deleted document
     * @param {string} id - Document ID
     */
    schema.statics.restore = async function (id) {
        // Explicitly include deleted docs to find it
        const doc = await this.findOne({ _id: id }).setOptions({ includeDeleted: true });
        if (!doc) return null;

        doc.isDeleted = false;
        doc.deletedAt = null;
        doc.deletedBy = null;
        return doc.save();
    };

    /**
     * Find only deleted documents
     */
    schema.statics.findDeleted = function () {
        return this.find({ isDeleted: true }).setOptions({ includeDeleted: true });
    };

    /**
     * Find all documents (including deleted)
     */
    schema.statics.findWithDeleted = function () {
        return this.find().setOptions({ includeDeleted: true });
    };

    /**
     * Instance method to soft delete
     */
    schema.methods.softDelete = async function (userId = null) {
        this.isDeleted = true;
        this.deletedAt = new Date();
        this.deletedBy = userId;
        return this.save();
    };

    /**
     * Instance method to restore
     */
    schema.methods.restore = async function () {
        this.isDeleted = false;
        this.deletedAt = null;
        this.deletedBy = null;
        return this.save();
    };
};

export default softDeletePlugin;
