import React from "react"
import { graphql } from "gatsby"

export default function Home() {
  return <div>Hello world!</div>
}

export const q = graphql`
  query($id: String!) {
    entity(id: { eq: $id }) {
      content_fields {
        childMarkdownRemark {
          excerpt
        }
      }
    }
  }
`
