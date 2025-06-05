import { describe, it, expect, beforeEach, vi } from 'vitest'
import { profileService, ProfileUpdateRequest } from '../profileService'
import { mockUsers, createMockUser, generateToken } from '../../test/mocks/handlers'

// Set up environment variable
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8080/api'
  },
  writable: true
})

describe('ProfileService', () => {
  beforeEach(() => {
    mockUsers.clear()
    localStorage.clear()
  })

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const testUser = createMockUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User'
      })
      mockUsers.set(testUser.id, testUser)
      
      const token = generateToken('testuser')
      localStorage.setItem('token', token)

      const result = await profileService.getProfile()

      expect(result.id).toBe(testUser.id)
      expect(result.username).toBe(testUser.username)
      expect(result.email).toBe(testUser.email)
      expect(result.profile).toBeDefined()
    })

    it('should fail to get profile without token', async () => {
      await expect(profileService.getProfile()).rejects.toThrow('No authentication token found')
    })

    it('should fail to get profile with invalid token', async () => {
      localStorage.setItem('token', 'invalid-token')

      await expect(profileService.getProfile()).rejects.toThrow('Failed to fetch profile')
    })
  })

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const testUser = createMockUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password'
      })
      mockUsers.set(testUser.id, testUser)
      
      const token = generateToken('testuser')
      localStorage.setItem('token', token)

      const updateData: ProfileUpdateRequest = {
        firstName: 'Updated',
        lastName: 'User',
        bio: 'Updated bio',
        location: 'New York, NY'
      }

      const result = await profileService.updateProfile(updateData)

      expect(result.profile.firstName).toBe('Updated')
      expect(result.profile.lastName).toBe('User')
      expect(result.profile.bio).toBe('Updated bio')
      expect(result.profile.location).toBe('New York, NY')
    })

    it('should fail to update profile without token', async () => {
      const updateData: ProfileUpdateRequest = {
        firstName: 'Updated'
      }

      await expect(profileService.updateProfile(updateData)).rejects.toThrow('No authentication token found')
    })
  })

  describe('completeProfile', () => {
    it('should complete profile successfully', async () => {
      const testUser = createMockUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password'
      })
      mockUsers.set(testUser.id, testUser)
      
      const token = generateToken('testuser')
      localStorage.setItem('token', token)

      const profileData: ProfileUpdateRequest = {
        firstName: 'Complete',
        lastName: 'User',
        bio: 'Complete bio',
        location: 'San Francisco, CA',
        skills: '["React", "TypeScript", "Node.js"]',
        jobTypes: '["Full-time", "Remote"]',
        preferredLocations: '["San Francisco", "Remote"]',
        salaryMin: 100000,
        salaryMax: 150000
      }

      const result = await profileService.completeProfile(profileData)

      expect(result.profile.firstName).toBe('Complete')
      expect(result.profile.lastName).toBe('User')
      expect(result.profile.bio).toBe('Complete bio')
      expect(result.profile.skills).toBe('["React", "TypeScript", "Node.js"]')
      expect(result.profile.salaryMin).toBe(100000)
      expect(result.profile.salaryMax).toBe(150000)
    })

    it('should fail to complete profile without token', async () => {
      const profileData: ProfileUpdateRequest = {
        firstName: 'Complete'
      }

      await expect(profileService.completeProfile(profileData)).rejects.toThrow('No authentication token found')
    })
  })

  describe('Helper methods', () => {
    describe('parseSkills', () => {
      it('should parse JSON skills string', () => {
        const skillsString = '["React", "TypeScript", "Node.js"]'
        const result = profileService.parseSkills(skillsString)
        
        expect(result).toEqual(['React', 'TypeScript', 'Node.js'])
      })

      it('should parse comma-separated skills string', () => {
        const skillsString = 'React, TypeScript, Node.js'
        const result = profileService.parseSkills(skillsString)
        
        expect(result).toEqual(['React', 'TypeScript', 'Node.js'])
      })

      it('should return empty array for empty string', () => {
        expect(profileService.parseSkills('')).toEqual([])
        expect(profileService.parseSkills(undefined)).toEqual([])
      })
    })

    describe('stringifySkills', () => {
      it('should stringify skills array', () => {
        const skills = ['React', 'TypeScript', 'Node.js']
        const result = profileService.stringifySkills(skills)
        
        expect(result).toBe('["React","TypeScript","Node.js"]')
      })
    })

    describe('parseJobTypes', () => {
      it('should parse JSON job types string', () => {
        const jobTypesString = '["Full-time", "Remote"]'
        const result = profileService.parseJobTypes(jobTypesString)
        
        expect(result).toEqual(['Full-time', 'Remote'])
      })

      it('should parse comma-separated job types string', () => {
        const jobTypesString = 'Full-time, Remote, Hybrid'
        const result = profileService.parseJobTypes(jobTypesString)
        
        expect(result).toEqual(['Full-time', 'Remote', 'Hybrid'])
      })
    })

    describe('parsePreferredLocations', () => {
      it('should parse JSON locations string', () => {
        const locationsString = '["San Francisco", "Remote", "New York"]'
        const result = profileService.parsePreferredLocations(locationsString)
        
        expect(result).toEqual(['San Francisco', 'Remote', 'New York'])
      })

      it('should parse comma-separated locations string', () => {
        const locationsString = 'San Francisco, Remote, New York'
        const result = profileService.parsePreferredLocations(locationsString)
        
        expect(result).toEqual(['San Francisco', 'Remote', 'New York'])
      })
    })
  })
}) 