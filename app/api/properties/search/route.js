import connectDB from '@/config/database'
import Property from '@/models/Property'

export const dynamic = 'force-dynamic'

// GET /api/properties/search
export const GET = async (request) => {
  try {
    await connectDB()

    // const { searchParams } = new URL(request.url)
    const searchParams = request.nextUrl.searchParams

    // any query params that we want, we just use the .get method
    const location = searchParams.get('location')
    const propertyType = searchParams.get('propertyType')

    // console.log(location, propertyType)
    // Create regex pattern, 'i' case insensitive
    const locationPattern = new RegExp(location, 'i')

    // Match location pattern against database fields
    let query = {
      $or: [
        { name: locationPattern },
        { description: locationPattern },
        { 'location.street': locationPattern },
        { 'location.city': locationPattern },
        { 'location.state': locationPattern },
        { 'location.zipcode': locationPattern },
      ],
    }

    // Only check for property if it's not 'All'
    if (propertyType && propertyType !== 'All') {
      const typePattern = new RegExp(propertyType, 'i')
      query.type = typePattern
    }

    const properties = await Property.find(query)

    return new Response(JSON.stringify(properties), { status: 200 })
  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify('Something went wrong'), { status: 500 })
  }
}
