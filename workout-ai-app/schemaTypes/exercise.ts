import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'exercise',
  title: 'Exercise',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Exercise Name',
      description: 'The name of the exercise (e.g., Push-ups, Squats, Deadlifts)',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(100)
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'Detailed instructions on how to perform the exercise correctly',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().min(10).max(500)
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty Level',
      description: 'The skill level required to perform this exercise safely',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' }
        ],
        layout: 'radio'
      },
      initialValue: 'beginner',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'image',
      title: 'Exercise Image',
      description: 'A visual demonstration image showing proper form for the exercise',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          title: 'Alternative Text',
          description: 'Describe the image for accessibility and SEO',
          type: 'string',
          validation: (Rule) => Rule.required()
        }
      ]
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      description: 'A link to a demonstration video showing how to perform the exercise',
      type: 'string',
      validation: (Rule) =>
        Rule.regex(
          /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w\-.?=&%]*)*\/?$/,
          { name: 'URL', invert: false }
        ).error('Please enter a valid URL')
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      description: 'Toggle to show or hide this exercise in the app',
      type: 'boolean',
      initialValue: true
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'difficulty',
      media: 'image'
    },
    prepare(selection) {
      const { title, subtitle } = selection
      return {
        title,
        subtitle: subtitle ? `Difficulty: ${subtitle.charAt(0).toUpperCase() + subtitle.slice(1)}` : 'No difficulty set'
      }
    }
  }
})