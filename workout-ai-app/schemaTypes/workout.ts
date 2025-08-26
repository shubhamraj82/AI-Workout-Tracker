import { defineField, defineType, defineArrayMember } from 'sanity'

export default defineType({
  name: 'workout',
  title: 'Workout',
  type: 'document',
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      description: 'The unique Clerk ID of the user who performed this workout',
      type: 'string',
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'date',
      title: 'Workout Date',
      description: 'The date when this workout was completed',
      type: 'datetime',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      description: 'Total workout duration in seconds',
      type: 'number',
      validation: (Rule) => Rule.required().min(0).integer()
    }),
    defineField({
      name: 'exercises',
      title: 'Exercises',
      description: 'List of exercises performed in this workout with sets, reps, and weights',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'exercise',
              title: 'Exercise',
              description: 'Reference to the exercise performed',
              type: 'reference',
              to: [{ type: 'exercise' }],
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'sets',
              title: 'Sets',
              description: 'Array of sets performed for this exercise',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'reps',
                      title: 'Repetitions',
                      description: 'Number of repetitions performed in this set',
                      type: 'number',
                      validation: (Rule) => Rule.required().min(0).integer()
                    }),
                    defineField({
                      name: 'weight',
                      title: 'Weight',
                      description: 'Weight used for this set',
                      type: 'number',
                      validation: (Rule) => Rule.min(0)
                    }),
                    defineField({
                      name: 'weightUnit',
                      title: 'Weight Unit',
                      description: 'Unit of measurement for the weight',
                      type: 'string',
                      options: {
                        list: [
                          { title: 'Pounds (lbs)', value: 'lbs' },
                          { title: 'Kilograms (kg)', value: 'kg' }
                        ],
                        layout: 'radio'
                      },
                      initialValue: 'lbs',
                      validation: (Rule) => Rule.required()
                    })
                  ],
                  preview: {
                    select: {
                      reps: 'reps',
                      weight: 'weight',
                      weightUnit: 'weightUnit'
                    },
                    prepare(selection) {
                      const { reps, weight, weightUnit } = selection
                      return {
                        title: `${reps} reps`,
                        subtitle: weight ? `${weight} ${weightUnit}` : 'Bodyweight'
                      }
                    }
                  }
                })
              ],
              validation: (Rule) => Rule.required().min(1)
            })
          ],
          preview: {
            select: {
              title: 'exercise.name',
              sets: 'sets'
            },
            prepare(selection) {
              const { title, sets } = selection
              const setCount = sets ? sets.length : 0
              return {
                title: title || 'Unknown Exercise',
                subtitle: `${setCount} set${setCount !== 1 ? 's' : ''}`
              }
            }
          }
        })
      ],
      validation: (Rule) => Rule.required().min(1)
    })
  ],
  preview: {
    select: {
      date: 'date',
      duration: 'duration',
      exercises: 'exercises',
      userId: 'userId'
    },
    prepare(selection) {
      const { date, duration, exercises, userId } = selection
      const exerciseCount = exercises ? exercises.length : 0
      const formattedDate = date ? new Date(date).toLocaleDateString() : 'Unknown Date'
      const formattedDuration = duration ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : '0:00'
      
      return {
        title: `Workout - ${formattedDate}`,
        subtitle: `${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''} • ${formattedDuration} • User: ${userId?.substring(0, 8) || 'Unknown'}...`
      }
    }
  },
  orderings: [
    {
      title: 'Date (newest first)',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }]
    },
    {
      title: 'Date (oldest first)',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }]
    },
    {
      title: 'Duration (longest first)',
      name: 'durationDesc',
      by: [{ field: 'duration', direction: 'desc' }]
    }
  ]
})