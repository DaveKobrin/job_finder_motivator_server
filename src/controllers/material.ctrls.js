const db = require('../models');

const create = async ( req, res ) => {
    console.log({body: req.body});
    try {
        const userId = await db.User.findOne({email: req.user.email})._id;
        const post = await db.Material.create({
            name: req.body.name,
            content: req.body.content,
            likes: 0,
            dislikes: 0,
            comments: [],
            owner: userId,
        });
        console.log({post});
        return res.status(201).json({ data: {post}, status: {code: 201, message: "SUCCESS: material added"} });
    } catch (err) {
        //catch any errors
        return res.status(400).json({ data: {}, status: {code: 400, message: err.message} });
    }
};

const index = async ( req, res ) => {
    try {
        const posts = await db.Material.find({}).populate("comments");
        console.log({posts});
        return res.status(200).json({ data: {posts}, status: {code: 200, message: "SUCCESS: materials returned"} });
    } catch (err) {
        //catch any errors
        return res.status(400).json({ data: {}, status: {code: 400, message: err.message} });
    }
};

const show = async ( req, res ) => {
    try {
        const post = await db.Material.findById(req.params.id).populate("comments");
        if (!post)
            return res.status(404).json({ data: {}, status: {code: 404, message: "ERROR: material not found"} });
        
        return res.status(200).json({ data: {post}, status: {code: 200, message: "SUCCESS: material returned"} });
    } catch (err) {
        //catch any errors
        return res.status(400).json({ data: {}, status: {code: 400, message: err.message} });
    }
};

const updateMaterial = async ( req, res ) => {
    try {
        const userId = await db.User.findOne({email: req.user.email})._id;
        const post = await db.Material.findById(req.params.materialId);
        if (!post)
            return res.status(404).json({ data: {}, status: {code: 404, message: "ERROR: material not found"} });
        
        if (post.owner != userId)
            return res.status(403).json({ data: {}, status: {code: 403, message: "FORBIDEN: user can only update their own post"} });

        post.name = req.body.name;
        post.content = req.body.content;
        post.save();
        return res.status(200).json({ data: {post}, status: {code: 200, message: "SUCCESS: material updated"} });

    } catch (err) {
        //catch any errors
        return res.status(400).json({ data: {}, status: {code: 400, message: err.message} });
    }
};

const createComment = async ( req, res ) => {
    try {
        const userId = await db.User.findOne({email: req.user.email})._id;
        const post = await db.Material.findById(req.params.materialId);
        if (!post)
            return res.status(404).json({ data: {}, status: {code: 404, message: "ERROR: material not found"} });
        const comment = db.Comment.create({
            createdBy: userId,
            content: req.body,
            comments: [],
            postID: post._id,
        });
        post.comments.push(comment._id);
        post.save();
        return res.status(201).json({ data: {post: post, comment: comment}, status: {code: 201, message: "SUCCESS: comment created"} });
    } catch (err) {
        //catch any errors
        return res.status(400).json({ data: {}, status: {code: 400, message: err.message} });
    }
};

const updateComment = async ( req, res ) => {
    try {
        const userId = await db.User.findOne({email: req.user.email})._id;
        const post = await db.Material.findById(req.params.materialId);
        if (!post)
            return res.status(404).json({ data: {}, status: {code: 404, message: "ERROR: material not found"} });
        
        if (post.owner != userId)
            return res.status(403).json({ data: {}, status: {code: 403, message: "FORBIDEN: user can only update their own post"} });

        const idx = post.comments.indexOf(req.params.commentId);
        if (idx === -1)
            return res.status(404).json({ data: {}, status: {code: 404, message: "ERROR: comment not found"} });

        const comment = db.Comment.findById(req.params.commentId);
        comment.content = req.body.content;
        comment.save();
        return res.status(200).json({ data: {comment}, status: {code: 200, message: "SUCCESS: comment updated"} });

    } catch (err) {
        //catch any errors
        return res.status(400).json({ data: {}, status: {code: 400, message: err.message} });
    }
};

const destroyComment = async ( req, res ) => {
    try {
        const userId = await db.User.findOne({email: req.user.email})._id;
        const post = await db.Material.findById(req.params.materialId);
        if (!post)
            return res.status(404).json({ data: {}, status: {code: 404, message: "ERROR: material not found"} });
        
        if (post.owner != userId)
            return res.status(403).json({ data: {}, status: {code: 403, message: "FORBIDEN: user can only delete their own post"} });

        const idx = post.comments.indexOf(req.params.commentId);
        if (idx === -1)
            return res.status(404).json({ data: {}, status: {code: 404, message: "ERROR: comment not found"} });
        
        await db.Comment.findByIdAndDelete(req.params.commentId);
        post.comments.splice( idx, 1 );
        post.save();
        return res.status(200).json({ data: {post}, status: {code: 200, message: "SUCCESS: comment deleted"} });
    } catch (err) {
        //catch any errors
        return res.status(400).json({ data: {}, status: {code: 400, message: err.message} });
    }
};

const destroyMaterial = async ( req, res ) => {
    try {
        const user = await db.User.findOne({email: req.user.email});
        const post = await db.Material.findById(req.params.id);
        if (post.owner != user._id)
            return res.status(403).json({ data: {}, status: {code: 403, message: "FORBIDEN: user can only delete their own post"} });

        await db.Comment.deleteMany({ _id: { $in: post.comments}});
        await db.Material.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: 'SUCCESS: material deleted' });
    } catch(err) {
        //catch any errors
        return res.status(400).json({ error: err.message });
    }
};

module.exports = {
    create,
    index,
    show,
    updateMaterial,
    createComment,
    updateComment,
    destroyComment,
    destroyMaterial,
};
