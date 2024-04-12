const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || null

/* 
So the way this works is we're going to create an API route to use mongoose to get the properties from the database.

And then from our front end right from this component, we're going to then fetch from our API route and then display the properties.
**/

// Fetch all properties
async function fetchProperties({ showFeatured = false } = {}) {
  try {
    //Handle the case where the domain is not available yet
    if (!apiDomain || apiDomain === null) {
      return []
    }

    const res = await fetch(
      `${apiDomain}/properties/${showFeatured ? 'featured' : ''}`,
      {
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }

    return res.json()
  } catch (error) {
    console.log(error)
    return []
  }
}

// Fetch single property
async function fetchProperty(id) {
  try {
    //Handle the case where the domain is not available yet
    if (!apiDomain) {
      return null
    }

    const res = await fetch(`${apiDomain}/properties/${id}`)

    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }

    return res.json()
  } catch (error) {
    // console.log(error)
    return null
  }
}

export { fetchProperties, fetchProperty }
