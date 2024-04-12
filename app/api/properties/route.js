import connectDB from '@/config/database'
import Property from '@/models/Property'
import { getSessionUser } from '@/utils/getSessionUser'
import cloudinary from '@/config/cloudinary'

export const dynamic = 'force-dynamic'

// GET /api/properties
export const GET = async (request) => {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get('page') || 1
    const pageSize = searchParams.get('pageSize') || 6

    const skip = (page - 1) * pageSize

    const total = await Property.countDocuments({})
    const properties = await Property.find({}).skip(skip).limit(pageSize)

    const result = {
      total,
      properties,
    }

    return new Response(JSON.stringify(result), { status: 200 })
    // return Response.json(result)
  } catch (error) {
    if (error.cause instanceof AggregateError) console.error(e.cause.errors)
    return new Response('Something went wrong...', { status: 500 })
  }
}

// POST /api/properties
export const POST = async (request) => {
  try {
    await connectDB()

    const sessionUser = await getSessionUser()

    if (!sessionUser || !sessionUser.userId) {
      return new Response('User ID is required', { status: 401 })
    }

    const { userId } = sessionUser

    const formData = await request.formData()

    // Access all values from amenities and images arrays
    const amenities = formData.getAll('amenities')
    const images = formData
      .getAll('images')
      .filter((image) => image.name !== '')

    // Create propertyData object for database
    const propertyData = {
      type: formData.get('type'),
      name: formData.get('name'),
      description: formData.get('description'),
      location: {
        street: formData.get('location.street'),
        city: formData.get('location.city'),
        state: formData.get('location.state'),
        zipcode: formData.get('location.zipcode'),
      },
      beds: formData.get('beds'),
      baths: formData.get('baths'),
      square_feet: formData.get('square_feet'),
      amenities,
      rates: {
        weekly: formData.get('rates.weekly'),
        monthly: formData.get('rates.monthly'),
        nightly: formData.get('rates.nightly'),
      },
      seller_info: {
        name: formData.get('seller_info.name'),
        email: formData.get('seller_info.email'),
        phone: formData.get('seller_info.phone'),
      },
      owner: userId,
    }

    // Upload image(s) to Cloudinary
    const imageUploadPromises = []

    for (const image of images) {
      const imageBuffer = await image.arrayBuffer()
      const imageArray = Array.from(new Uint8Array(imageBuffer))
      const imageData = Buffer.from(imageArray)

      // Convert image data to base64
      const imageBase64 = imageData.toString('base64')

      // Make request to upload to Cloudinary
      const result = await cloudinary.uploader.upload(
        `data:image/png;base64,${imageBase64}`,
        { folder: 'propertypulse' }
      )

      imageUploadPromises.push(result.secure_url)

      // Wait for all images to upload
      const uploadedImages = await Promise.all(imageUploadPromises)
      // Add uploaded images to propertyData object
      propertyData.images = uploadedImages
    }

    const newProperty = new Property(propertyData)
    console.log(newProperty)
    await newProperty.save()

    return Response.redirect(
      `${process.env.NEXTAUTH_URL}/properties/${newProperty._id}`
    )

    // return new Response(
    //   JSON.stringify(
    //     { message: 'Success' },
    //     {
    //       status: 200,
    //     }
    //   )
    // )
  } catch (error) {
    return new Response('Failed to add new property', { status: 500 })
  }
}
