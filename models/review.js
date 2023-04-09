const mongoose = require('mongoose')

const ReviewSchema = mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'please Provide rating'],
    },
    title: {
        type: String,
        trim: true,
        required: [true, 'please Provide review Title'],
        maxlength: 100,
    },
    comment: {
        type: String,
        required: [true, 'please Provide review text'],
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true,
    },

},
    { timestamp: true }
);

// this is for - the only one user can review a single product and don not give multiple review
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (productId){
const result = await this.aggregate([
    {$match: {
      product: productId
    }},
    {$group: {
      _id: null,
     averageRating: {$avg: '$rating'},
     numOfReviews:{ $sum: 1},
      },
    },
]);
try {
    await this.model('Product').findOneUpdate(
        {_id: productId},
        {
            averageRating: Math.ceil(result[0]?.averageRating || 0),
            numOfReviews: Math.ceil(result[0]?.numOfReviews || 0)
        }
    )
} catch (error) {
    console.log(error)
}
}

ReviewSchema.post('save' , async function () {
    await this.constructor.calculateAverageRating(this.product)
})

ReviewSchema.post('remove' , async function () {
    await this.constructor.calculateAverageRating(this.product)
})

module.exports = mongoose.model('Review', ReviewSchema)